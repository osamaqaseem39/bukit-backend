import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { LocationsService } from '../clients/locations.service';
import { FacilitiesService } from '../clients/facilities.service';
import { UserRole } from '../users/user.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly locationsService: LocationsService,
    private readonly facilitiesService: FacilitiesService,
  ) {}

  async create(
    createBookingDto: CreateBookingDto,
    user: { id: string; role: UserRole },
  ): Promise<Booking> {
    const { location_id, facility_id, start_time, end_time, status } =
      createBookingDto;

    const location = await this.locationsService.findOne(location_id);

    // Non-admins can only book their own locations (via client) or any public location?
    // For now, enforce that CLIENT can only book their own locations; USER can book any.
    if (user.role === UserRole.CLIENT && location.client_id !== user.id) {
      throw new ForbiddenException(
        'You can only create bookings for your own locations',
      );
    }

    if (facility_id) {
      // Ensure facility belongs to the same location
      const facility = await this.facilitiesService.findOneForLocation(
        location_id,
        facility_id,
        { id: user.id, role: user.role },
      );
      if (!facility) {
        throw new NotFoundException('Facility not found for this location');
      }
    }

    const booking = this.bookingRepository.create({
      user_id: user.id,
      location_id,
      facility_id: facility_id || null,
      start_time: new Date(start_time),
      end_time: new Date(end_time),
      status: status || BookingStatus.PENDING,
    });

    return await this.bookingRepository.save(booking);
  }

  async findAll(user: { id: string; role: UserRole }): Promise<Booking[]> {
    if (user.role === UserRole.ADMIN) {
      return await this.bookingRepository.find();
    }

    // Non-admins see only their own bookings
    return await this.bookingRepository.find({
      where: { user_id: user.id },
    });
  }

  async findOne(id: string, user: { id: string; role: UserRole }): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({ where: { id } });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    if (user.role !== UserRole.ADMIN && booking.user_id !== user.id) {
      throw new ForbiddenException('You can only access your own bookings');
    }

    return booking;
  }

  async update(
    id: string,
    updateBookingDto: UpdateBookingDto,
    user: { id: string; role: UserRole },
  ): Promise<Booking> {
    const booking = await this.findOne(id, user);
    Object.assign(booking, {
      ...updateBookingDto,
      start_time:
        updateBookingDto.start_time !== undefined
          ? new Date(updateBookingDto.start_time as string | Date)
          : booking.start_time,
      end_time:
        updateBookingDto.end_time !== undefined
          ? new Date(updateBookingDto.end_time as string | Date)
          : booking.end_time,
    });
    return await this.bookingRepository.save(booking);
  }

  async cancel(id: string, user: { id: string; role: UserRole }): Promise<Booking> {
    const booking = await this.findOne(id, user);
    booking.status = BookingStatus.CANCELLED;
    return await this.bookingRepository.save(booking);
  }
}


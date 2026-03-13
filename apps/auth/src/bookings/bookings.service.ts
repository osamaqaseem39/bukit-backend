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
    const {
      location_id,
      facility_id,
      start_time,
      end_time,
      status,
      is_walk_in,
      guest_name,
      guest_phone,
      amount,
      currency,
    } = createBookingDto;

    const location = await this.locationsService.findOne(location_id);

    // CLIENT can only book their own locations
    if (
      user.role === UserRole.CLIENT &&
      location.client?.user_id !== user.id
    ) {
      throw new ForbiddenException(
        'You can only create bookings for your own locations',
      );
    }

    // LOCATION_MANAGER can only book for their assigned location
    if (
      user.role === UserRole.LOCATION_MANAGER &&
      (user as any).managed_location_id !== location_id
    ) {
      throw new ForbiddenException(
        'You can only create bookings for your assigned location',
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
      is_walk_in: Boolean(is_walk_in),
      guest_name: guest_name ?? null,
      guest_phone: guest_phone ?? null,
      amount: amount ?? null,
      currency: currency ?? null,
    });

    return await this.bookingRepository.save(booking);
  }

  async findAll(user: { id: string; role: UserRole }): Promise<Booking[]> {
    if (user.role === UserRole.ADMIN) {
      return await this.bookingRepository.find();
    }

    // LOCATION_MANAGER sees all bookings for their assigned location
    if (user.role === UserRole.LOCATION_MANAGER) {
      return await this.bookingRepository.find({
        where: { location_id: (user as any).managed_location_id },
      });
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

    // ADMIN can access any booking
    if (user.role === UserRole.ADMIN) {
      return booking;
    }

    // LOCATION_MANAGER can access bookings for their assigned location
    if (
      user.role === UserRole.LOCATION_MANAGER &&
      booking.location_id === (user as any).managed_location_id
    ) {
      return booking;
    }

    // Other users can only access their own bookings
    if (booking.user_id !== user.id) {
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

  async checkIn(
    id: string,
    user: { id: string; role: UserRole },
  ): Promise<Booking> {
    const booking = await this.findOne(id, user);
    booking.checked_in_at = new Date();
    booking.check_in_status = 'checked_in';
    if (booking.status === BookingStatus.PENDING) {
      booking.status = BookingStatus.CONFIRMED;
    }
    return await this.bookingRepository.save(booking);
  }

  async getDailyLedger(
    params: {
      date?: string;
      location_id?: string;
      facility_id?: string;
    },
    user: { id: string; role: UserRole },
  ): Promise<Booking[]> {
    const target = params.date ? new Date(params.date) : new Date();
    const startOfDay = new Date(target);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(target);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const qb = this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.start_time >= :startOfDay', { startOfDay })
      .andWhere('booking.start_time <= :endOfDay', { endOfDay });

    if (user.role === UserRole.ADMIN) {
      // no additional filter
    } else if (user.role === UserRole.LOCATION_MANAGER) {
      qb.andWhere('booking.location_id = :locationId', {
        locationId: (user as any).managed_location_id,
      });
    } else {
      qb.andWhere('booking.user_id = :userId', { userId: user.id });
    }

    if (params.location_id) {
      qb.andWhere('booking.location_id = :locationId', {
        locationId: params.location_id,
      });
    }

    if (params.facility_id) {
      qb.andWhere('booking.facility_id = :facilityId', {
        facilityId: params.facility_id,
      });
    }

    return qb.orderBy('booking.start_time', 'ASC').getMany();
  }

  async getBookingsReport(
    params: {
      from?: string;
      to?: string;
      location_id?: string;
      facility_id?: string;
    },
    user: { id: string; role: UserRole },
  ): Promise<
    {
      date: string;
      total_bookings: number;
      confirmed: number;
      pending: number;
      cancelled: number;
      walk_ins: number;
      revenue: number | null;
    }[]
  > {
    const now = new Date();
    const defaultTo = new Date(now);
    defaultTo.setUTCHours(23, 59, 59, 999);
    const defaultFrom = new Date(now);
    defaultFrom.setUTCDate(defaultFrom.getUTCDate() - 6);
    defaultFrom.setUTCHours(0, 0, 0, 0);

    const fromDate = params.from ? new Date(params.from) : defaultFrom;
    const toDate = params.to ? new Date(params.to) : defaultTo;

    const qb = this.bookingRepository
      .createQueryBuilder('booking')
      .select("DATE_TRUNC('day', booking.start_time)", 'date')
      .addSelect('COUNT(*)', 'total_bookings')
      .addSelect(
        `SUM(CASE WHEN booking.status = :confirmed THEN 1 ELSE 0 END)`,
        'confirmed',
      )
      .addSelect(
        `SUM(CASE WHEN booking.status = :pending THEN 1 ELSE 0 END)`,
        'pending',
      )
      .addSelect(
        `SUM(CASE WHEN booking.status = :cancelled THEN 1 ELSE 0 END)`,
        'cancelled',
      )
      .addSelect(
        `SUM(CASE WHEN booking.is_walk_in = true THEN 1 ELSE 0 END)`,
        'walk_ins',
      )
      .addSelect('SUM(booking.amount)', 'revenue')
      .where('booking.start_time >= :fromDate', { fromDate })
      .andWhere('booking.start_time <= :toDate', { toDate })
      .setParameters({
        confirmed: BookingStatus.CONFIRMED,
        pending: BookingStatus.PENDING,
        cancelled: BookingStatus.CANCELLED,
      });

    if (user.role === UserRole.ADMIN) {
      // no additional filter
    } else if (user.role === UserRole.LOCATION_MANAGER) {
      qb.andWhere('booking.location_id = :locationIdUser', {
        locationIdUser: (user as any).managed_location_id,
      });
    } else {
      qb.andWhere('booking.user_id = :userId', { userId: user.id });
    }

    if (params.location_id) {
      qb.andWhere('booking.location_id = :locationId', {
        locationId: params.location_id,
      });
    }

    if (params.facility_id) {
      qb.andWhere('booking.facility_id = :facilityId', {
        facilityId: params.facility_id,
      });
    }

    qb.groupBy("DATE_TRUNC('day', booking.start_time)").orderBy(
      "DATE_TRUNC('day', booking.start_time)",
      'ASC',
    );

    const rows = await qb.getRawMany<{
      date: Date;
      total_bookings: string;
      confirmed: string;
      pending: string;
      cancelled: string;
      walk_ins: string;
      revenue: string | null;
    }>();

    return rows.map((row) => ({
      date: row.date.toISOString().slice(0, 10),
      total_bookings: Number(row.total_bookings),
      confirmed: Number(row.confirmed),
      pending: Number(row.pending),
      cancelled: Number(row.cancelled),
      walk_ins: Number(row.walk_ins),
      revenue: row.revenue !== null ? Number(row.revenue) : null,
    }));
  }
}


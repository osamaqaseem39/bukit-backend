sales
- id
- client_id
- location_id
- user_id
- booking_id
- source
- status
- payment_method
- subtotal
- tax_total
- discount_total
- total
- currency
- paid_at
- notes
- created_at
- updated_at

sale_items
- id
- sale_id
- facility_id
- location_id
- name
- quantity
- unit_price
- duration_minutes
- tax_rate
- tax_amount
- discount_amount
- total
- metadata

expenses
- id
- client_id
- location_id
- category
- amount
- currency
- incurred_at
- description
- created_by
- created_at
- updated_at

customers
- id
- client_id
- name
- phone
- email
- notes
- created_at
- updated_at

payments
- id
- sale_id
- amount
- currency
- method
- reference
- paid_at
- created_at

shifts
- id
- client_id
- location_id
- user_id
- opened_at
- closed_at
- opening_cash
- closing_cash
- expected_cash
- notes

time_extensions
- id
- sale_id
- booking_id
- facility_id
- location_id
- original_end_time
- extended_end_time
- extra_minutes
- extra_amount
- created_by
- created_at

facility_shifts
- id
- facility_id
- location_id
- client_id
- shift_date
- start_time
- end_time
- status
- assigned_user_id
- created_at
- updated_at


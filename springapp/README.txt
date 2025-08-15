Dependency Analysis
1. User → Independent (root entity, nothing depends on it being created first).
2. Facility → depends on User (managerId FK, optional).
3. Vehicle → depends on User (userId FK).
4. ParkingSlot → depends on Facility (facilityId FK).
5. Booking → depends on User (userId) and ParkingSlot (slotId FK).
6. Payment → depends on Booking (bookingId FK).
7. BookingHistory → depends on Booking (bookingId FK) and optionally User (changedBy FK).
8. FacilityAnalytics → depends on Facility (facilityId FK).
9. Notification → depends on User (userId FK).

Correct Insertion Order for Swagger
(To avoid foreign key constraint violations):
1. User
2. Facility (needs User if manager is set)
3. Vehicle (needs User)
4. ParkingSlot (needs Facility)
5. Booking (needs User + ParkingSlot)
6. Payment (needs Booking)
7. BookingHistory (needs Booking + optionally User)
8. FacilityAnalytics (needs Facility)
9. Notification (needs User)
import React from 'react';
import { CalendarDays, Clock, UserCheck, Search, HelpCircle } from 'lucide-react';
import Badge from '../ui/Badge';
import Button from '../ui/Button';

export default function BookingList({ bookings, onCheckIn, branchName }) {
  // Filter bookings to only show Confirmed ones (i.e. not yet checked in)
  const confirmedBookings = bookings.filter(b => b.status === 'Confirmed');

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col h-full min-h-[500px]">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-800 text-base">Today's Bookings</h3>
          <p className="text-xs text-slate-500 mt-0.5">Awaiting physical arrival at {branchName || 'Selected Branch'}</p>
        </div>
        <Badge variant="secondary" className="px-2 py-0.5 text-xs font-bold text-slate-700 bg-slate-100">
          {confirmedBookings.length} Scheduled
        </Badge>
      </div>

      {/* Booking List Cards */}
      <div className="p-5 overflow-y-auto flex-1 space-y-4 max-h-[600px]">
        {confirmedBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4 h-full text-center">
            <div className="bg-slate-50 p-4 rounded-full text-slate-400 mb-4 border border-slate-100">
              <CalendarDays className="h-8 w-8" />
            </div>
            <p className="font-semibold text-slate-700 text-sm">No Scheduled Bookings Remaining</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[240px]">
              All patients for today are either checked-in, completed, or no appointments are currently booked.
            </p>
          </div>
        ) : (
          confirmedBookings.map((booking) => {
            const isConsultation = booking.type === 'Consultation';
            const badgeVariant = isConsultation ? 'info' : (booking.type === 'Procedure' ? 'warning' : 'default');

            return (
              <div 
                key={booking.id}
                className="group relative p-4 rounded-xl border border-slate-150 bg-slate-50/30 hover:bg-white hover:border-clinic-200 hover:shadow-sm transition-all duration-200"
              >
                {/* Details layout */}
                <div className="flex flex-col space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm leading-tight group-hover:text-clinic-700 transition-colors">
                        {booking.patientName}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 font-medium">{booking.patientPhone}</p>
                    </div>
                    <Badge variant={badgeVariant} className="text-[10px] uppercase font-bold py-0.5 px-2">
                      {booking.type}
                    </Badge>
                  </div>

                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                    {/* Time Indicator */}
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold bg-slate-100/80 px-2 py-1 rounded-md">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{booking.time}</span>
                    </div>

                    {/* Check In Action Button */}
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => onCheckIn(booking.id)}
                      className="flex items-center gap-1 text-xs px-2.5 h-8 font-semibold shadow-xs transition-all hover:translate-x-[2px]"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Check-In</span>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

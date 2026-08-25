import React, { createContext, useState, useContext } from 'react';

const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [sourceStation, setSourceStation] = useState(null); // { _id, stationId, stationName, lineName, location }
  const [destinationStation, setDestinationStation] = useState(null);
  const [routeDetails, setRouteDetails] = useState(null); // { path, distance, duration, fare, etc. }
  
  // Form fields
  const [passengerDetails, setPassengerDetails] = useState({
    passengerName: '',
    passengerEmail: '',
    passengerPhone: '',
    passengerCount: 1,
    journeyDate: new Date().toISOString().slice(0, 10),
    journeyTime: '08:00'
  });

  const [activeBooking, setActiveBooking] = useState(null); // Store current pending booking from backend

  const resetBooking = () => {
    setSourceStation(null);
    setDestinationStation(null);
    setRouteDetails(null);
    setActiveBooking(null);
    setPassengerDetails({
      passengerName: '',
      passengerEmail: '',
      passengerPhone: '',
      passengerCount: 1,
      journeyDate: new Date().toISOString().slice(0, 10),
      journeyTime: '08:00'
    });
  };

  return (
    <BookingContext.Provider
      value={{
        sourceStation,
        setSourceStation,
        destinationStation,
        setDestinationStation,
        routeDetails,
        setRouteDetails,
        passengerDetails,
        setPassengerDetails,
        activeBooking,
        setActiveBooking,
        resetBooking
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => useContext(BookingContext);

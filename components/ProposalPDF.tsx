
import React from 'react';
import { ProposalData, HotelDetails, MarkupType, VatRule, HotelImage, FlightDetails, FlightLeg, MarkupConfig, FlightQuote, TransportationDetails, ActivityDetails, CustomItem } from '../types';
import { PalmLogo, BusIcon, ActivityIcon, PlaneIcon, BedIcon, MeetingIcon, UtensilsIcon } from './Icons';

// --- Logic Helpers ---

const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
};

// Pricing Breakdown Helper
const calculatePriceBreakdown = (net: number, markup: MarkupConfig, vatRule: VatRule, vatPercent: number = 15, quantity: number = 1, days: number = 1) => {
    let markupAmount = 0;
    const totalNet = net * quantity * days;

    if (markup.type === MarkupType.Fixed) {
        markupAmount = markup.value * quantity * days;
    } else {
        markupAmount = totalNet * (markup.value / 100);
    }

    const basePrice = totalNet + markupAmount;
    let subTotal = 0;
    let vatAmount = 0;
    let grandTotal = 0;

    if (vatRule === 'domestic') {
        subTotal = basePrice;
        vatAmount = subTotal * (vatPercent / 100);
        grandTotal = subTotal + vatAmount;
    } else {
        // International: VAT on markup only
        const vatOnMarkup = markupAmount * (vatPercent / 100);
        subTotal = basePrice; // Sell price before VAT (technically includes markup)
        vatAmount = vatOnMarkup;
        grandTotal = subTotal + vatAmount;
    }

    return { subTotal, vatAmount, grandTotal };
};

// Flight Specific Helper
const calculateFlightTotal = (quotes: FlightQuote[], markup: MarkupConfig, vatRule: VatRule, vatPercent: number) => {
    let legSubTotal = 0;
    let legVat = 0;
    let legGrandTotal = 0;

    quotes.forEach(q => {
        // q.price is Net Price per seat
        // q.quantity is Number of seats
        const { subTotal, vatAmount, grandTotal } = calculatePriceBreakdown(q.price, markup, vatRule, vatPercent, q.quantity, 1);
        legSubTotal += subTotal;
        legVat += vatAmount;
        legGrandTotal += grandTotal;
    });

    return { subTotal: legSubTotal, vatAmount: legVat, grandTotal: legGrandTotal };
};

// --- Components ---

interface LegDisplayProps {
    leg: FlightLeg;
}
const LegDisplay: React.FC<LegDisplayProps> = ({ leg }) => (
    <div className="flex gap-4 mb-4 last:mb-0 relative pl-4 border-l-2 border-gray-200 break-inside-avoid">
        <div className="absolute -left-[5px] top-1 w-2 h-2 bg-gray-300 rounded-full"></div>
        <div className="flex-1">
            <div className="flex justify-between items-center mb-1">
                {/* 16.1 / 8: Bold & Larger Airline Name */}
                <div className="text-2xl font-bold text-gray-800">{leg.airline} <span className="text-sm font-normal text-gray-500">({leg.flightNumber})</span></div>
                <div className="text-xs text-gray-400">{leg.duration}</div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <div className="font-bold text-corporate-blue">{leg.from}</div>
                    <div className="text-gray-500">{leg.departureDate} @ {leg.departureTime}</div>
                </div>
                <div className="text-right">
                    <div className="font-bold text-corporate-blue">{leg.to}</div>
                    <div className="text-gray-500">{leg.arrivalDate} @ {leg.arrivalTime}</div>
                </div>
            </div>
        </div>
    </div>
);

// --- Sections ---

const CoverPage: React.FC<{ data: ProposalData }> = ({ data }) => (
    <div className="w-full min-h-screen flex flex-col justify-between bg-white page-break relative overflow-hidden">
        {/* Header Pattern */}
        <div className="w-full h-32 bg-corporate-blue relative overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #0ea5e9 10px, #0ea5e9 20px)' }}></div>
            <div className="absolute bottom-0 right-0 p-8">
                {/* Optional: Add SITC Logo here if needed, or keep it central */}
            </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 relative z-10">
            {data.branding.companyLogo ? (
                <img src={data.branding.companyLogo} className="h-48 mx-auto object-contain mb-12" alt="Company Logo" />
            ) : (
                <div className="h-48 w-48 bg-gray-200 rounded-full mx-auto mb-12 flex items-center justify-center text-gray-400">No Logo</div>
            )}

            <h1 className="text-6xl font-display font-bold text-corporate-blue mb-6 tracking-tight uppercase">{data.proposalName}</h1>
            <div className="w-32 h-2 bg-corporate-gold mx-auto mb-8"></div>
            <h2 className="text-3xl font-light text-gray-600 mb-8 uppercase tracking-widest">{data.customerName}</h2>
        </div>

        <div className="p-12 bg-slate-50 border-t-4 border-corporate-gold relative z-10">
            <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
                <div>
                    <span className="block text-gray-400 uppercase text-xs font-bold tracking-wider mb-1">Date</span>
                    <span className="block font-bold text-corporate-blue text-lg">{new Date(data.lastModified).toLocaleDateString()}</span>
                </div>
                <div>
                    <span className="block text-gray-400 uppercase text-xs font-bold tracking-wider mb-1">Prepared By</span>
                    <span className="block font-bold text-corporate-blue text-lg">{data.branding.contactName}</span>
                </div>
                <div>
                    <span className="block text-gray-400 uppercase text-xs font-bold tracking-wider mb-1">Contact</span>
                    <span className="block font-bold text-corporate-blue text-lg">{data.branding.contactEmail}</span>
                </div>
            </div>
        </div>

        {/* Footer Pattern */}
        <div className="w-full h-16 bg-corporate-blue relative overflow-hidden">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #0ea5e9 10px, #0ea5e9 20px)' }}></div>
        </div>
    </div>
);

const TermsPage: React.FC = () => (
    <div className="w-full min-h-screen bg-white p-16 page-break flex flex-col">
        <div className="border-b-2 border-corporate-gold pb-6 mb-12">
            <h2 className="text-4xl font-bold text-corporate-blue uppercase tracking-tight">General Terms & Conditions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-gray-600 text-sm leading-relaxed">
            <div className="space-y-6">
                <div>
                    <h3 className="font-bold text-corporate-blue mb-2">1. Booking Confirmation</h3>
                    <p>All bookings are subject to availability at the time of confirmation. Prices are subject to change without prior notice until the final booking is secured.</p>
                </div>
                <div>
                    <h3 className="font-bold text-corporate-blue mb-2">2. Payment Policy</h3>
                    <p>Full payment is required 14 days prior to arrival to guarantee the reservation. We accept bank transfers and major credit cards.</p>
                </div>
                <div>
                    <h3 className="font-bold text-corporate-blue mb-2">3. Cancellation Policy</h3>
                    <p>Cancellations made more than 30 days before arrival will incur no charges. Cancellations between 14-30 days will be charged 50%. Cancellations within 14 days are non-refundable.</p>
                </div>
            </div>
            <div className="space-y-6">
                <div>
                    <h3 className="font-bold text-corporate-blue mb-2">4. Flight Changes</h3>
                    <p>Flight schedules are subject to change by the airline. We are not responsible for delays or cancellations by the carrier.</p>
                </div>
                <div>
                    <h3 className="font-bold text-corporate-blue mb-2">5. Travel Documents</h3>
                    <p>Passengers are responsible for ensuring they have valid passports and visas for travel.</p>
                </div>
                <div>
                    <h3 className="font-bold text-corporate-blue mb-2">6. Liability</h3>
                    <p>We act only as agents for the passenger in regard to travel, whether by railroad, motorcar, motorcoach, boat, or airplane, and assume no liability for injury, damage, loss, accident, delay, or irregularity.</p>
                </div>
            </div>
        </div>

        {/* Footer Pattern */}
        <div className="mt-auto pt-12">
            <div className="w-full h-8 bg-corporate-blue relative overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #0ea5e9 10px, #0ea5e9 20px)' }}></div>
            </div>
        </div>
    </div>
);

const HotelSection: React.FC<{ hotel: HotelDetails, index: number, pricing: any }> = ({ hotel, index, pricing }) => {
    // Determine Image Layout
    const images = hotel.images;

    const renderPrice = (label: string, subLabel: string, amount: number) => {
        if (!pricing.showPrices) return null;
        return (
            <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <div>
                    <div className="font-bold text-gray-700">{label}</div>
                    <div className="text-xs text-gray-400">{subLabel}</div>
                </div>
                <div className="font-bold text-corporate-blue text-lg">{formatCurrency(amount, pricing.currency)}</div>
            </div>
        );
    };

    return (
        <div className="w-full min-h-screen bg-white p-12 page-break flex flex-col">
            <div className="flex justify-between items-end border-b-4 border-corporate-gold pb-4 mb-8">
                <h2 className="text-4xl font-bold text-corporate-blue uppercase tracking-tight">
                    {hotel.name}
                </h2>
                <span className="text-gray-400 font-bold text-lg">Option {index + 1}</span>
            </div>

            {/* 3-Image Grid Layout */}
            {images.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mb-8 h-96 break-inside-avoid">
                    {/* Main Image */}
                    <div className="col-span-2 h-full rounded-lg overflow-hidden shadow-md">
                        <img src={images[0].url} className="w-full h-full object-cover" alt="Hotel Main" />
                    </div>
                    {/* Side Images */}
                    <div className="col-span-1 flex flex-col gap-4 h-full">
                        {images.slice(1, 3).map((img, i) => (
                            <div key={i} className="h-full rounded-lg overflow-hidden shadow-sm">
                                <img src={img.url} className="w-full h-full object-cover" alt="Hotel Side" />
                            </div>
                        ))}
                        {images.length < 2 && <div className="h-full bg-gray-100 rounded-lg"></div>}
                        {images.length < 3 && <div className="h-full bg-gray-100 rounded-lg"></div>}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-8">
                <div className="bg-slate-50 p-6 rounded-lg border-l-4 border-corporate-blue">
                    <h3 className="text-sm font-bold text-corporate-blue uppercase tracking-wider mb-2">Property Details</h3>
                    {hotel.location && <div className="text-gray-700 mb-1"><strong>Location:</strong> {hotel.location}</div>}
                    {hotel.website && <div className="text-blue-500 underline"><a href={hotel.website} target="_blank" rel="noreferrer">Visit Website</a></div>}
                </div>

                {pricing.showPrices && (
                    <div className="break-inside-avoid">
                        <h3 className="text-lg font-bold text-corporate-blue uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Accommodation Rates</h3>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-corporate-blue text-white">
                                <tr>
                                    <th className="p-3">Room Type</th>
                                    <th className="p-3">Check In / Out</th>
                                    <th className="p-3 text-center">Nights</th>
                                    <th className="p-3 text-center">Qty</th>
                                    <th className="p-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {hotel.roomTypes.map((rt, i) => {
                                    const { grandTotal } = calculatePriceBreakdown(rt.netPrice, pricing.markups.hotels, hotel.vatRule, pricing.vatPercent, 1, rt.numNights);
                                    const totalForLine = grandTotal * rt.quantity;
                                    return (
                                        <tr key={i}>
                                            <td className="p-3 font-bold text-gray-700">{rt.name}</td>
                                            <td className="p-3 text-gray-500">{rt.checkIn} - {rt.checkOut}</td>
                                            <td className="p-3 text-center">{rt.numNights}</td>
                                            <td className="p-3 text-center">{rt.quantity}</td>
                                            <td className="p-3 text-right font-bold text-corporate-blue">{formatCurrency(totalForLine, pricing.currency)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Meeting Rooms & Dining Tables if needed */}
                {(hotel.meetingRooms.length > 0 || hotel.dining.length > 0) && pricing.showPrices && (
                    <div className="break-inside-avoid mt-8">
                        <h3 className="text-lg font-bold text-corporate-blue uppercase tracking-wider mb-4 border-b border-gray-200 pb-2">Events & Dining</h3>
                        <table className="w-full text-sm text-left">
                            <thead className="bg-corporate-blue text-white">
                                <tr>
                                    <th className="p-3">Service Description</th>
                                    <th className="p-3 text-center">Days</th>
                                    <th className="p-3 text-center">Guests</th>
                                    <th className="p-3 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {hotel.meetingRooms.map((m, i) => {
                                    const { grandTotal } = calculatePriceBreakdown(m.price, pricing.markups.meetings, hotel.vatRule, pricing.vatPercent, m.quantity, m.days);
                                    return (
                                        <tr key={`m-${i}`}>
                                            <td className="p-3 font-bold text-gray-700">{m.name} <span className="text-xs font-normal text-gray-400 block">{m.startDate} - {m.endDate}</span></td>
                                            <td className="p-3 text-center">{m.days}</td>
                                            <td className="p-3 text-center">{m.quantity}</td>
                                            <td className="p-3 text-right font-bold text-corporate-blue">{formatCurrency(grandTotal, pricing.currency)}</td>
                                        </tr>
                                    );
                                })}
                                {hotel.dining.map((d, i) => {
                                    const { grandTotal } = calculatePriceBreakdown(d.price, pricing.markups.meetings, hotel.vatRule, pricing.vatPercent, d.quantity, d.days);
                                    return (
                                        <tr key={`d-${i}`}>
                                            <td className="p-3 font-bold text-gray-700">{d.name} <span className="text-xs font-normal text-gray-400 block">{d.startDate} - {d.endDate}</span></td>
                                            <td className="p-3 text-center">{d.days}</td>
                                            <td className="p-3 text-center">{d.quantity}</td>
                                            <td className="p-3 text-right font-bold text-corporate-blue">{formatCurrency(grandTotal, pricing.currency)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

const FlightSection: React.FC<{ flights: FlightDetails[], pricing: any }> = ({ flights, pricing }) => (
    <div className="w-full min-h-screen bg-slate-50 p-10 page-break flex flex-col">
        <div className="flex justify-between items-center border-b-2 border-corporate-blue/20 pb-4 mb-8">
            <div className="flex items-center gap-3">
                <div className="bg-corporate-blue text-white w-10 h-10 flex items-center justify-center rounded-lg"><PlaneIcon /></div>
                <h2 className="text-3xl font-bold text-corporate-blue">Flight Itinerary</h2>
            </div>
        </div>

        {flights.map((flight, idx) => {
            // 16.1 Flight Pricing Calculation Per Quote
            const quotesBreakdown = flight.quotes.map(q => {
                const { grandTotal } = calculatePriceBreakdown(q.price, pricing.markups.flights, flight.vatRule, pricing.vatPercent, q.quantity, 1);
                return { ...q, grandTotal };
            });

            return (
                <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8 break-inside-avoid">
                    <h3 className="text-xl font-bold text-gray-700 mb-6 border-l-4 border-corporate-gold pl-3">{flight.routeDescription || `Option ${idx + 1}`}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Outbound</h4>
                            <div className="space-y-4">
                                {flight.outbound.map((leg, i) => <LegDisplay key={i} leg={leg} />)}
                            </div>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Return</h4>
                            <div className="space-y-4">
                                {flight.return.map((leg, i) => <LegDisplay key={i} leg={leg} />)}
                            </div>
                        </div>
                    </div>

                    {pricing.showPrices && (
                        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
                            <h4 className="font-bold text-gray-700 mb-4 text-sm uppercase">Total Cost Estimate</h4>
                            <div className="space-y-2">
                                {quotesBreakdown.map((q, i) => (
                                    <div key={i} className="flex justify-between items-center text-sm">
                                        <span>{q.class} Class <span className="text-gray-400">({q.quantity} Seats)</span></span>
                                        <span className="font-bold text-corporate-blue">{formatCurrency(q.grandTotal, pricing.currency)}</span>
                                    </div>
                                ))}
                                <div className="border-t border-gray-300 mt-2 pt-2 flex justify-between items-center font-bold text-lg">
                                    <span>Total</span>
                                    <span className="text-corporate-blue">
                                        {formatCurrency(quotesBreakdown.reduce((acc, curr) => acc + curr.grandTotal, 0), pricing.currency)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            );
        })}
    </div>
);

// 6. Center Aligned Transportation
const TransportSection: React.FC<{ transport: TransportationDetails[], pricing: any }> = ({ transport, pricing }) => (
    <div className="w-full min-h-screen bg-slate-50 p-10 page-break flex flex-col items-center">
        <div className="w-full text-center border-b-2 border-corporate-blue/20 pb-4 mb-12">
            <h2 className="text-3xl font-bold text-corporate-blue inline-flex items-center gap-3">
                <BusIcon /> Transportation
            </h2>
        </div>

        <div className="grid grid-cols-1 gap-12 w-full max-w-4xl">
            {transport.map((item, i) => {
                const { grandTotal } = calculatePriceBreakdown(item.netPricePerDay, pricing.markups.transportation, item.vatRule, pricing.vatPercent, item.quantity, item.days);
                return (
                    <div key={i} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden break-inside-avoid text-center">
                        {item.image && (
                            <div className="w-full bg-gray-100 flex items-center justify-center p-4">
                                <img src={item.image} className="max-h-[400px] w-auto max-w-[90%] object-contain" alt={item.model} />
                            </div>
                        )}
                        <div className="p-8">
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">{item.model}</h3>
                            <p className="text-gray-500 mb-4">{item.type} • {item.description}</p>
                            <div className="inline-block bg-slate-50 rounded-lg px-8 py-4 border border-slate-100">
                                {pricing.showPrices && (
                                    <div className="text-3xl font-bold text-corporate-blue mb-1">
                                        {formatCurrency(grandTotal, pricing.currency)}
                                    </div>
                                )}
                                <div className="text-xs text-gray-400 font-medium">
                                    {item.quantity} Vehicle(s) × {item.days} Day(s)
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);

const ActivitiesSection: React.FC<{ activities: ActivityDetails[], pricing: any }> = ({ activities, pricing }) => (
    <div className="w-full min-h-screen bg-slate-50 p-10 page-break">
        <div className="flex items-center gap-3 border-b-2 border-corporate-blue/20 pb-4 mb-8">
            <div className="bg-corporate-blue text-white w-10 h-10 flex items-center justify-center rounded-lg"><ActivityIcon /></div>
            <h2 className="text-3xl font-bold text-corporate-blue">Activities & Tours</h2>
        </div>
        <div className="grid grid-cols-2 gap-8">
            {activities.map((act, i) => {
                const { grandTotal } = calculatePriceBreakdown(act.pricePerPerson, pricing.markups.activities, act.vatRule, pricing.vatPercent, act.guests, act.days);
                return (
                    <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden break-inside-avoid flex flex-col">
                        {act.image && (
                            <div className="h-48 w-full bg-gray-100">
                                <img src={act.image} className="w-full h-full object-cover" alt={act.name} />
                            </div>
                        )}
                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{act.name}</h3>
                            <div className="text-sm text-gray-500 mb-4">
                                {act.startDate} to {act.endDate} ({act.days} Days) • {act.guests} Guests
                            </div>
                            {pricing.showPrices && (
                                <div className="mt-auto pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-sm text-gray-400">Total Price</span>
                                    <span className="text-xl font-bold text-corporate-blue">{formatCurrency(grandTotal, pricing.currency)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);

const CustomSection: React.FC<{ items: CustomItem[], pricing: any }> = ({ items, pricing }) => (
    <div className="w-full min-h-screen bg-slate-50 p-10 page-break">
        <div className="flex items-center gap-3 border-b-2 border-corporate-blue/20 pb-4 mb-8">
            <h2 className="text-3xl font-bold text-corporate-blue">Additional Services</h2>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            {items.map((item, i) => {
                const { grandTotal } = calculatePriceBreakdown(item.unitPrice, pricing.markups.customItems, item.vatRule, pricing.vatPercent, item.quantity, item.days);
                return (
                    <div key={i} className="flex justify-between items-center py-4 border-b border-gray-100 last:border-0">
                        <div>
                            <div className="font-bold text-gray-700 text-lg">{item.description}</div>
                            <div className="text-sm text-gray-400">{item.days} Days • {item.quantity} Units</div>
                        </div>
                        {pricing.showPrices && <div className="text-xl font-bold text-corporate-blue">{formatCurrency(grandTotal, pricing.currency)}</div>}
                    </div>
                );
            })}
        </div>
    </div>
);

// 18. Per-Hotel Grand Total Calculation in Summary
const SummaryPage: React.FC<{ data: ProposalData }> = ({ data }) => {
    const { pricing } = data;
    const currency = pricing.currency;

    // 1. Calculate Shared Costs (Flights, Transport, Activities, Custom)
    // These are added to EACH package.

    let sharedSub = 0;
    let sharedVat = 0;
    let sharedGrand = 0;

    const renderLineItem = (label: string, sub: number, vat: number, grand: number) => (
        <div className="flex justify-between items-center py-2 text-sm border-b border-gray-100 last:border-0">
            <span className="font-bold text-gray-700">{label}</span>
            <span className="font-bold text-gray-800">{formatCurrency(grand, currency)}</span>
        </div>
    );

    // Shared Components Calculation
    const sharedComponents: React.ReactNode[] = [];

    // Flights
    if (data.inclusions.flights && data.flightOptions.length > 0) {
        let flightsTotal = 0;
        data.flightOptions.forEach(f => {
            if (f.includeInSummary !== false) {
                const { subTotal, vatAmount, grandTotal } = calculateFlightTotal(f.quotes, pricing.markups.flights, f.vatRule, pricing.vatPercent);
                sharedSub += subTotal;
                sharedVat += vatAmount;
                sharedGrand += grandTotal;
                flightsTotal += grandTotal;
            }
        });
        if (flightsTotal > 0) {
            sharedComponents.push(renderLineItem("Flights Total", 0, 0, flightsTotal));
        }
    }

    // Transport
    if (data.inclusions.transportation && data.transportation.length > 0) {
        let transTotal = 0;
        data.transportation.forEach(t => {
            if (t.includeInSummary !== false) {
                const { subTotal, vatAmount, grandTotal } = calculatePriceBreakdown(t.netPricePerDay, pricing.markups.transportation, t.vatRule, pricing.vatPercent, t.quantity, t.days);
                sharedSub += subTotal;
                sharedVat += vatAmount;
                sharedGrand += grandTotal;
                transTotal += grandTotal;
            }
        });
        if (transTotal > 0) {
            sharedComponents.push(renderLineItem("Transportation Total", 0, 0, transTotal));
        }
    }

    // Activities & Custom
    let extrasTotal = 0;
    data.activities.forEach(a => {
        if (a.includeInSummary !== false) {
            const { subTotal, vatAmount, grandTotal } = calculatePriceBreakdown(a.pricePerPerson, pricing.markups.activities, a.vatRule, pricing.vatPercent, a.guests, a.days);
            sharedSub += subTotal;
            sharedVat += vatAmount;
            sharedGrand += grandTotal;
            extrasTotal += grandTotal;
        }
    });
    data.customItems.forEach(c => {
        if (c.includeInSummary !== false) {
            const { subTotal, vatAmount, grandTotal } = calculatePriceBreakdown(c.unitPrice, pricing.markups.customItems, c.vatRule, pricing.vatPercent, c.quantity, c.days);
            sharedSub += subTotal;
            sharedVat += vatAmount;
            sharedGrand += grandTotal;
            extrasTotal += grandTotal;
        }
    });
    if (extrasTotal > 0) {
        sharedComponents.push(renderLineItem("Activities & Extras Total", 0, 0, extrasTotal));
    }


    return (
        <div className="w-full min-h-screen bg-white p-12 page-break flex flex-col">
            <div className="border-b-4 border-corporate-gold pb-4 mb-8">
                <h2 className="text-4xl font-bold text-corporate-blue uppercase tracking-tight">Investment Summary</h2>
            </div>

            <div className="flex-1">
                {/* 18.2 Render Package Per Hotel Option */}
                {data.hotelOptions.length > 0 ? (
                    data.hotelOptions.map((h, index) => {
                        // Calculate Hotel Specifics
                        let hotelSub = 0;
                        let hotelVat = 0;
                        let hotelGrand = 0;

                        const rows: any[] = [];

                        // Sum All Room Types
                        h.roomTypes.forEach(r => {
                            if (r.includeInSummary !== false) {
                                const res = calculatePriceBreakdown(r.netPrice, pricing.markups.hotels, h.vatRule, pricing.vatPercent, r.quantity, r.numNights);
                                hotelSub += res.subTotal;
                                hotelVat += res.vatAmount;
                                hotelGrand += res.grandTotal;
                                rows.push({ name: `Accommodation: ${h.name} - ${r.name}`, price: res.grandTotal / r.quantity, nights: r.numNights, qty: r.quantity, total: res.grandTotal });
                            }
                        });
                        h.meetingRooms.forEach(m => {
                            if (m.includeInSummary !== false) {
                                const res = calculatePriceBreakdown(m.price, pricing.markups.meetings, h.vatRule, pricing.vatPercent, m.quantity, m.days);
                                hotelSub += res.subTotal;
                                hotelVat += res.vatAmount;
                                hotelGrand += res.grandTotal;
                                rows.push({ name: `Event: ${m.name}`, price: res.grandTotal / m.quantity, nights: m.days, qty: m.quantity, total: res.grandTotal });
                            }
                        });
                        h.dining.forEach(d => {
                            if (d.includeInSummary !== false) {
                                const res = calculatePriceBreakdown(d.price, pricing.markups.meetings, h.vatRule, pricing.vatPercent, d.quantity, d.days);
                                hotelSub += res.subTotal;
                                hotelVat += res.vatAmount;
                                hotelGrand += res.grandTotal;
                                rows.push({ name: `Dining: ${d.name}`, price: res.grandTotal / d.quantity, nights: d.days, qty: d.quantity, total: res.grandTotal });
                            }
                        });

                        // Combine with Shared
                        const packageSub = hotelSub + sharedSub;
                        const packageVat = hotelVat + sharedVat;
                        const packageGrand = hotelGrand + sharedGrand;

                        return (
                            <div key={index} className="mb-12 break-inside-avoid">
                                <h3 className="font-bold text-xl text-corporate-blue mb-4">Option {index + 1}: {h.name}</h3>
                                <table className="w-full text-sm text-left mb-6">
                                    <thead className="bg-corporate-blue text-white">
                                        <tr>
                                            <th className="p-3 w-1/2">Service Description</th>
                                            <th className="p-3 text-right">Unit Price</th>
                                            <th className="p-3 text-center">Nights/Days</th>
                                            <th className="p-3 text-center">Quantity</th>
                                            <th className="p-3 text-right">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 border border-gray-100">
                                        {rows.map((row, i) => (
                                            <tr key={i}>
                                                <td className="p-3 font-medium text-gray-700">{row.name}</td>
                                                <td className="p-3 text-right text-gray-500">{formatCurrency(row.price, currency)}</td>
                                                <td className="p-3 text-center text-gray-500">{row.nights}</td>
                                                <td className="p-3 text-center text-gray-500">{row.qty}</td>
                                                <td className="p-3 text-right font-bold text-gray-700">{formatCurrency(row.total, currency)}</td>
                                            </tr>
                                        ))}
                                        {/* Shared Services Rows (Simplified for brevity, ideally map them too) */}
                                        {sharedGrand > 0 && (
                                            <tr>
                                                <td className="p-3 font-medium text-gray-700">Other Services (Flights, Transport, Activities)</td>
                                                <td className="p-3 text-right text-gray-500">-</td>
                                                <td className="p-3 text-center text-gray-500">-</td>
                                                <td className="p-3 text-center text-gray-500">1</td>
                                                <td className="p-3 text-right font-bold text-gray-700">{formatCurrency(sharedGrand, currency)}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>

                                <div className="flex justify-end">
                                    <div className="w-1/3 bg-slate-50 p-6 rounded-lg border border-gray-200">
                                        <div className="flex justify-between items-center mb-2 text-sm text-gray-500">
                                            <span>Sub Total</span>
                                            <span>{formatCurrency(packageSub, currency)}</span>
                                        </div>
                                        <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
                                            <span>VAT (15%)</span>
                                            <span>{formatCurrency(packageVat, currency)}</span>
                                        </div>
                                        <div className="h-px bg-gray-300 mb-4"></div>
                                        <div className="flex justify-between items-center text-2xl font-bold text-corporate-blue">
                                            <span>Grand Total</span>
                                            <span>{formatCurrency(packageGrand, currency)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center text-gray-500">No options configured.</div>
                )}
            </div>

            {/* Footer Pattern */}
            <div className="mt-auto pt-8">
                <div className="w-full h-8 bg-corporate-blue relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #0ea5e9 10px, #0ea5e9 20px)' }}></div>
                </div>
            </div>
        </div>
    );
};

const ThankYouPage: React.FC<{ data: ProposalData }> = ({ data }) => (
    <div className="w-full min-h-screen bg-corporate-blue flex flex-col items-center justify-center text-center p-12 page-break relative overflow-hidden text-white">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, #0ea5e9 20px, #0ea5e9 40px)' }}></div>

        <div className="relative z-10 max-w-2xl">
            <h1 className="text-6xl font-display font-bold mb-8 tracking-tight">Thank You</h1>
            <p className="text-xl font-light text-blue-100 mb-12 leading-relaxed">
                We appreciate the opportunity to propose these services for you. We look forward to creating an unforgettable experience.
            </p>

            <div className="w-24 h-1 bg-corporate-gold mx-auto mb-12 rounded-full"></div>

            <div className="text-blue-200">
                <p className="font-bold text-white text-lg mb-2">{data.branding.contactName}</p>
                <p>{data.branding.contactEmail}</p>
                <p className="mt-4 text-sm opacity-70">www.sitc.com.sa</p>
            </div>
        </div>
    </div>
);

export const ProposalPDF: React.FC<{ data: ProposalData }> = ({ data }) => {
    return (
        <div className="print-container font-sans text-gray-900 bg-white">
            <CoverPage data={data} />
            <TermsPage />
            {data.inclusions.hotels && data.hotelOptions.map((h, i) => <HotelSection key={i} hotel={h} index={i} pricing={data.pricing} />)}
            {data.inclusions.flights && data.flightOptions.length > 0 && <FlightSection flights={data.flightOptions} pricing={data.pricing} />}
            {data.inclusions.transportation && data.transportation.length > 0 && <TransportSection transport={data.transportation} pricing={data.pricing} />}
            {data.inclusions.activities && data.activities.length > 0 && <ActivitiesSection activities={data.activities} pricing={data.pricing} />}
            {data.inclusions.customItems && data.customItems.length > 0 && <CustomSection items={data.customItems} pricing={data.pricing} />}
            <SummaryPage data={data} />
            <ThankYouPage data={data} />
        </div>
    );
};

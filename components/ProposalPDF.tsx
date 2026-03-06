
import React from 'react';
import { ProposalData, HotelDetails, MarkupType, VatRule, HotelImage, FlightDetails, FlightLeg, MarkupConfig, FlightQuote, TransportationDetails, ActivityDetails, CustomItem } from '../types';
import { PalmLogo, BusIcon, ActivityIcon, PlaneIcon, BedIcon, MeetingIcon, UtensilsIcon } from './Icons';

// --- Theme Colors ---
const COLORS = {
    blue: '#1D4486',
    gold: '#CBA135',
    cream: '#F9F7F2',
    text: '#333333',
    muted: '#666666',
    divider: '#E5E7EB',
    tableHeader: '#1D4486',
    stripe: 'rgba(29, 68, 134, 0.1)'
};

// --- Logic Helpers ---

const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    }).format(amount);
};

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
        const vatOnMarkup = markupAmount * (vatPercent / 100);
        subTotal = basePrice;
        vatAmount = vatOnMarkup;
        grandTotal = subTotal + vatAmount;
    }

    return { subTotal, vatAmount, grandTotal };
};

const calculateFlightTotal = (quotes: FlightQuote[], markup: MarkupConfig, vatRule: VatRule, vatPercent: number) => {
    let legSubTotal = 0;
    let legVat = 0;
    let legGrandTotal = 0;

    quotes.forEach(q => {
        const { subTotal, vatAmount, grandTotal } = calculatePriceBreakdown(q.price, markup, vatRule, vatPercent, q.quantity, 1);
        legSubTotal += subTotal;
        legVat += vatAmount;
        legGrandTotal += grandTotal;
    });

    return { subTotal: legSubTotal, vatAmount: legVat, grandTotal: legGrandTotal };
};

// --- Components ---

const LegDisplay: React.FC<{ leg: FlightLeg }> = ({ leg }) => (
    <div className="flex flex-col gap-1 mb-6 last:mb-0 break-inside-avoid">
        <div className="flex justify-between items-center bg-gray-50 p-2 rounded border-l-4 border-[#1D4486]">
            <div className="font-bold text-[#1D4486] text-lg">{leg.airline} <span className="text-gray-400 font-normal text-sm">{leg.flightNumber}</span></div>
            <div className="text-xs text-gray-500">{leg.duration}</div>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-2 px-2">
            <div>
                <div className="text-xs uppercase font-bold text-gray-400">Outbound</div>
                <div className="font-bold text-lg">{leg.from}</div>
                <div className="text-sm text-gray-600 font-medium">{leg.departureDate} @ {leg.departureTime}</div>
            </div>
            <div className="text-right">
                <div className="text-xs uppercase font-bold text-gray-400">Return</div>
                <div className="font-bold text-lg">{leg.to}</div>
                <div className="text-sm text-gray-600 font-medium">{leg.arrivalDate} @ {leg.arrivalTime}</div>
            </div>
        </div>
    </div>
);

// --- Sections ---

// 1. Opening.pdf
const OpeningSection: React.FC<{ data: ProposalData }> = ({ data }) => {
    // Attempt to extract dates from hotel options
    let dateRange = "TBD";
    if (data.hotelOptions.length > 0) {
        const first = data.hotelOptions[0].roomTypes[0];
        const last = data.hotelOptions[data.hotelOptions.length - 1].roomTypes[0];
        if (first && last) {
            dateRange = `${first.checkIn} - ${last.checkOut}`;
        }
    }

    return (
        <div className="w-full min-h-screen bg-white flex page-break items-center relative overflow-hidden">
            <div className="flex-1 p-20 flex flex-col justify-center">
                <div className="border border-gray-200 p-8 inline-block max-w-xl">
                    <h1 className="text-4xl font-bold text-[#1D4486] mb-2">{data.customerName} | {dateRange}</h1>
                </div>
            </div>
            <div className="w-1/3 min-h-screen bg-[#F9F7F2] flex items-center justify-center p-12">
                <div className="border border-gray-200 p-8 bg-white flex flex-col items-center">
                    {data.branding.companyLogo ? (
                        <img src={data.branding.companyLogo} className="max-h-64 object-contain" alt="Logo" />
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-gray-200 font-bold uppercase tracking-widest text-center italic">
                            Saudi International Travel Company
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// 2. Terms and Conditions.pdf
const TermsSection: React.FC = () => (
    <div className="w-full min-h-screen bg-white p-20 page-break flex flex-col">
        <h2 className="text-4xl font-bold text-[#1D4486] mb-12 border-b-2 border-[#CBA135] pb-4">GENERAL TERMS & CONDITIONS</h2>
        <div className="grid grid-cols-2 gap-16 text-gray-700 leading-relaxed">
            <div className="space-y-8">
                <div>
                    <h3 className="font-bold text-[#1D4486] mb-2">1. Booking Confirmation</h3>
                    <p className="text-sm">All bookings are subject to availability at the time of confirmation. Prices are subject to change without prior notice until the final booking is secured.</p>
                </div>
                <div>
                    <h3 className="font-bold text-[#1D4486] mb-2">2. Payment Policy</h3>
                    <p className="text-sm">Full payment is required 14 days prior to arrival to guarantee the reservation. We accept bank transfers and major credit cards.</p>
                </div>
                <div>
                    <h3 className="font-bold text-[#1D4486] mb-2">3. Cancellation Policy</h3>
                    <p className="text-sm">Cancellations made more than 30 days before arrival will incur no charges. Cancellations between 14-30 days will be charged 50%. Cancellations within 14 days are non-refundable.</p>
                </div>
            </div>
            <div className="space-y-8">
                <div>
                    <h3 className="font-bold text-[#1D4486] mb-2">4. Flight Changes</h3>
                    <p className="text-sm">Flight schedules are subject to change by the airline. We are not responsible for delays or cancellations by the carrier.</p>
                </div>
                <div>
                    <h3 className="font-bold text-[#1D4486] mb-2">5. Travel Documents</h3>
                    <p className="text-sm">Passengers are responsible for ensuring they have valid passports and visas for travel.</p>
                </div>
                <div>
                    <h3 className="font-bold text-[#1D4486] mb-2">6. Liability</h3>
                    <p className="text-sm">We act only as agents for the passenger in regard to travel, whether by railroad, motorcar, motorcoach, boat, or airplane, and assume no liability for injury, damage, loss, accident, delay, or irregularity.</p>
                </div>
            </div>
        </div>
    </div>
);

// 3. Hotel Picture.pdf
const HotelPictureSection: React.FC<{ hotel: HotelDetails }> = ({ hotel }) => {
    const images = hotel.images;
    return (
        <div className="w-full min-h-screen bg-white p-16 page-break flex flex-col">
            <div className="border border-gray-200 p-4 mb-8 inline-block">
                <h2 className="text-3xl font-bold text-[#1D4486]">{hotel.name}</h2>
            </div>
            <div className="grid grid-cols-12 gap-4 flex-1">
                {/* Image 1: Left (Full height) */}
                <div className="col-span-8 border border-gray-100 rounded overflow-hidden">
                    {images[0] ? (
                        <img src={images[0].url} className="w-full h-full object-cover" alt="Hotel 1" />
                    ) : (
                        <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">No Image</div>
                    )}
                </div>
                {/* Images 2 & 3: Right (Stacked) */}
                <div className="col-span-4 flex flex-col gap-4">
                    <div className="flex-1 border border-gray-100 rounded overflow-hidden">
                        {images[1] ? (
                            <img src={images[1].url} className="w-full h-full object-cover" alt="Hotel 2" />
                        ) : (
                            <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">No Image</div>
                        )}
                    </div>
                    <div className="flex-1 border border-gray-100 rounded overflow-hidden">
                        {images[2] ? (
                            <img src={images[2].url} className="w-full h-full object-cover" alt="Hotel 3" />
                        ) : (
                            <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">No Image</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// 4. Property .pdf
const PropertyDetailsSection: React.FC<{ hotel: HotelDetails, index: number, pricing: any }> = ({ hotel, index, pricing }) => {
    const rows: any[] = [];
    hotel.roomTypes.forEach(rt => {
        const { subTotal, grandTotal } = calculatePriceBreakdown(rt.netPrice, pricing.markups.hotels, hotel.vatRule, pricing.vatPercent, 1, rt.numNights);
        rows.push({
            desc: `Accommodation: ${rt.name}`,
            unit: rt.netPrice, // Using unit net price as shown in screenshot table
            nights: rt.numNights,
            qty: rt.quantity,
            total: grandTotal * rt.quantity
        });
    });
    hotel.meetingRooms.forEach(m => {
        const { grandTotal } = calculatePriceBreakdown(m.price, pricing.markups.meetings, hotel.vatRule, pricing.vatPercent, m.quantity, m.days);
        rows.push({
            desc: `Meeting room: ${m.name}`,
            unit: m.price,
            nights: m.days,
            qty: m.quantity,
            total: grandTotal
        });
    });
    hotel.dining.forEach(d => {
        const { grandTotal } = calculatePriceBreakdown(d.price, pricing.markups.meetings, hotel.vatRule, pricing.vatPercent, d.quantity, d.days);
        rows.push({
            desc: `Dining: ${d.name}`,
            unit: d.price,
            nights: d.days,
            qty: d.quantity,
            total: grandTotal
        });
    });

    const finalTotal = rows.reduce((acc, row) => acc + row.total, 0);

    return (
        <div className="w-full min-h-screen bg-white p-16 page-break flex flex-col">
            <h2 className="text-3xl font-bold text-[#1D4486] mb-8">Property Details</h2>
            <div className="w-full border-t-2 border-[#CBA135] pt-4 mb-4">
                <p className="text-[#CBA135] text-xl font-bold">Grand Total - Option {index + 1}</p>
            </div>
            <div className="border border-gray-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-[#1D4486] text-white">
                        <tr>
                            <th className="p-4 uppercase text-[11px] tracking-wider border-r border-[#ffffff1a]">Service Description</th>
                            <th className="p-4 uppercase text-[11px] tracking-wider border-r border-[#ffffff1a] text-center">Unit price</th>
                            <th className="p-4 uppercase text-[11px] tracking-wider border-r border-[#ffffff1a] text-center">Nights</th>
                            <th className="p-4 uppercase text-[11px] tracking-wider border-r border-[#ffffff1a] text-center">Quantity</th>
                            <th className="p-4 uppercase text-[11px] tracking-wider text-right">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-gray-700">
                        {rows.map((row, i) => (
                            <tr key={i} className="bg-white">
                                <td className="p-4 border-r border-gray-200">{row.desc}</td>
                                <td className="p-4 border-r border-gray-200 text-center">{formatCurrency(row.unit, pricing.currency)}</td>
                                <td className="p-4 border-r border-gray-200 text-center">{row.nights}</td>
                                <td className="p-4 border-r border-gray-200 text-center">{row.qty}</td>
                                <td className="p-4 text-right font-bold">{formatCurrency(row.total, pricing.currency)}</td>
                            </tr>
                        ))}
                        <tr className="bg-[#1D4486] text-white font-bold">
                            <td colSpan={4} className="p-4 text-center uppercase tracking-widest text-xs">Final total</td>
                            <td className="p-4 text-right">{formatCurrency(finalTotal, pricing.currency)}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// 5. Flight Details.pdf
const FlightSection: React.FC<{ flight: FlightDetails, index: number, pricing: any }> = ({ flight, index, pricing }) => {
    const quotesBreakdown = flight.quotes.map(q => {
        const { grandTotal } = calculatePriceBreakdown(q.price, pricing.markups.flights, flight.vatRule, pricing.vatPercent, q.quantity, 1);
        return { ...q, grandTotal };
    });
    const totalFlight = quotesBreakdown.reduce((acc, curr) => acc + curr.grandTotal, 0);

    return (
        <div className="w-full min-h-screen bg-white p-16 page-break flex flex-col">
            <h2 className="text-3xl font-bold text-[#1D4486] mb-8">Flight Itinerary</h2>
            <div className="w-full border-t-2 border-[#CBA135] pt-4 mb-6">
                <p className="text-[#CBA135] text-xl font-bold">Grand Total - Option {index + 1}</p>
            </div>

            {/* Route Box */}
            <div className="p-8 border-l-4 border-[#CBA135] bg-gray-50 mb-8">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">{flight.routeDescription || "Flight Route"}</h3>
                <div className="grid grid-cols-2 gap-12">
                    <div>
                        <h4 className="text-xs uppercase font-bold text-gray-400 mb-4 tracking-widest">Outbound</h4>
                        {flight.outbound.map((leg, i) => <LegDisplay key={i} leg={leg} />)}
                    </div>
                    <div>
                        <h4 className="text-xs uppercase font-bold text-gray-400 mb-4 tracking-widest">Return</h4>
                        {flight.return.map((leg, i) => <LegDisplay key={i} leg={leg} />)}
                    </div>
                </div>

                {/* Pricing Box inside route box */}
                <div className="mt-12 bg-white p-6 border border-gray-200 rounded-lg">
                    <h4 className="text-sm uppercase font-bold text-gray-400 mb-4 border-b border-gray-100 pb-2">Total Cost Estimate</h4>
                    <div className="space-y-4">
                        {quotesBreakdown.map((q, i) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                                <span className="font-bold text-gray-600">{q.class} Class <span className="text-gray-400 font-normal">({q.quantity} Seats)</span></span>
                                <span className="font-bold text-[#1D4486] text-lg">{formatCurrency(q.grandTotal, pricing.currency)}</span>
                            </div>
                        ))}
                        <div className="pt-4 border-t-2 border-gray-100 flex justify-between items-center">
                            <span className="text-lg font-bold">Total</span>
                            <span className="text-2xl font-bold text-[#1D4486]">{formatCurrency(totalFlight, pricing.currency)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 6. Transportation.pdf
const TransportSection: React.FC<{ item: TransportationDetails, pricing: any, index: number }> = ({ item, pricing, index }) => {
    const { grandTotal } = calculatePriceBreakdown(item.netPricePerDay, pricing.markups.transportation, item.vatRule, pricing.vatPercent, item.quantity, item.days);
    return (
        <div className="w-full min-h-screen bg-white p-16 page-break flex flex-col items-center justify-center">
            <h2 className="text-3xl font-bold text-[#1D4486] self-start mb-12">Transportation</h2>
            <div className="w-full flex-1 flex flex-col items-center justify-center">
                <div className="border border-gray-100 p-8 mb-8 max-w-4xl w-full flex items-center justify-center bg-gray-50 rounded-xl overflow-hidden min-h-[400px]">
                    {item.image ? (
                        <img src={item.image} className="max-h-[350px] object-contain" alt="Car" />
                    ) : (
                        <div className="text-gray-200 text-6xl font-black">CAR IMAGE</div>
                    )}
                </div>
                <div className="text-center bg-gray-50 p-12 border border-gray-100 rounded-2xl w-full max-w-2xl transform shadow-lg">
                    <h3 className="text-3xl font-bold text-gray-800 mb-2">{item.model}</h3>
                    <p className="text-gray-500 mb-6 font-medium uppercase tracking-widest text-sm">{item.type} • {item.description}</p>
                    <div className="text-5xl font-black text-[#1D4486] mb-2">{formatCurrency(grandTotal, pricing.currency)}</div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{item.quantity} Vehicles • {item.days} Days</p>
                </div>
            </div>
        </div>
    );
};

// 7 & 8 Investment Summaries (Accommodation / Flight)
const InvestmentSummarySection: React.FC<{ title: string, subtitle: string, rows: any[], pricing: any }> = ({ title, subtitle, rows, pricing }) => {
    const finalTotal = rows.reduce((acc, row) => acc + (row.total || 0), 0);
    return (
        <div className="w-full min-h-screen bg-white p-16 page-break flex flex-col">
            <h2 className="text-4xl font-bold text-[#1D4486] mb-8">{title}</h2>
            <div className="w-full border-t-2 border-[#CBA135] pt-4 mb-8">
                <p className="text-[#CBA135] text-xl font-bold uppercase tracking-tight">{subtitle}</p>
            </div>
            <div className="border border-gray-200">
                <table className="w-full text-sm text-left">
                    <thead className="bg-[#1D4486] text-white">
                        <tr>
                            <th className="p-4 uppercase text-[10px] font-bold tracking-widest border-r border-[#ffffff1a]">Service Description</th>
                            <th className="p-4 uppercase text-[10px] font-bold tracking-widest border-r border-[#ffffff1a] text-center">Unit Price</th>
                            <th className="p-4 uppercase text-[10px] font-bold tracking-widest border-r border-[#ffffff1a] text-center">Nights/Days</th>
                            <th className="p-4 uppercase text-[10px] font-bold tracking-widest border-r border-[#ffffff1a] text-center">Quantity</th>
                            <th className="p-4 uppercase text-[10px] font-bold tracking-widest text-right">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {rows.map((row, i) => (
                            <tr key={i} className="bg-white">
                                <td className="p-4 text-gray-700 font-medium">{row.name}</td>
                                <td className="p-4 text-center text-gray-500">{formatCurrency(row.price, pricing.currency)}</td>
                                <td className="p-4 text-center text-gray-500">{row.nights}</td>
                                <td className="p-4 text-center text-gray-500">{row.qty}</td>
                                <td className="p-4 text-right font-bold text-gray-800">{formatCurrency(row.total, pricing.currency)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-8 self-end w-1/3 p-8 bg-gray-50 border border-gray-200 rounded-xl shadow-inner">
                <div className="flex justify-between items-center text-sm text-gray-500 mb-2 font-bold uppercase tracking-widest">
                    <span>Sub Total</span>
                    <span>{formatCurrency(finalTotal * 0.85, pricing.currency)}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500 mb-4 font-bold uppercase tracking-widest">
                    <span>VAT (15%)</span>
                    <span>{formatCurrency(finalTotal * 0.15, pricing.currency)}</span>
                </div>
                <div className="h-px bg-gray-300 mb-4"></div>
                <div className="flex justify-between items-center">
                    <span className="text-sm font-bold uppercase tracking-widest text-gray-400">Grand Total</span>
                    <span className="text-3xl font-black text-[#1D4486]">{formatCurrency(finalTotal, pricing.currency)}</span>
                </div>
            </div>
        </div>
    );
};

// 9. Thank you!.pdf
const ThankYouSection: React.FC<{ data: ProposalData }> = ({ data }) => (
    <div className="w-full min-h-screen bg-[#1D4486] flex flex-col items-center justify-center text-center p-20 page-break relative overflow-hidden text-white">
        {/* Diagonal Stripe Background Pattern */}
        <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 20px, white 20px, white 40px)`
        }}></div>

        <div className="relative z-10">
            <h1 className="text-8xl font-black mb-12 transform -rotate-1">Thank You</h1>
            <p className="text-2xl font-light text-blue-100 max-w-4xl mx-auto leading-relaxed mb-16 opacity-80">
                We appreciate the opportunity to propose these services for you. We look forward to creating an unforgettable experience.
            </p>
            <div className="w-48 h-2 bg-[#CBA135] mx-auto mb-16 rounded-full shadow-lg shadow-gold/20"></div>

            <div className="p-8 border border-white/20 inline-block bg-white/5 backdrop-blur-sm rounded-2xl shadow-2xl">
                <p className="text-3xl font-bold text-white mb-2">{data.branding.contactName || "Sales Representative"}</p>
                <p className="text-xl text-blue-200 font-medium mb-6">{data.branding.contactEmail || "ZAIDSIDDIQ9@GMAIL.COM"}</p>
                <p className="text-sm tracking-widest uppercase opacity-40 font-bold">www.sitc.com.sa</p>
            </div>
        </div>
    </div>
);

// --- Main Document ---

export const ProposalPDF: React.FC<{ data: ProposalData }> = ({ data }) => {
    return (
        <div className="print-container font-sans text-gray-900 bg-white shadow-2xl">
            {/* 1. Opening */}
            <OpeningSection data={data} />

            {/* 2. Terms & Conditions */}
            <TermsSection />

            {/* 3 & 4. Accommodations (Loop) */}
            {data.inclusions.hotels && data.hotelOptions.map((h, i) => (
                <React.Fragment key={`hotel-${i}`}>
                    <HotelPictureSection hotel={h} />
                    <PropertyDetailsSection hotel={h} index={i} pricing={data.pricing} />
                </React.Fragment>
            ))}

            {/* 5. Flight Details (Loop) */}
            {data.inclusions.flights && data.flightOptions.map((f, i) => (
                <FlightSection key={`flight-${i}`} flight={f} index={i} pricing={data.pricing} />
            ))}

            {/* 6. Transportation (Loop) */}
            {data.inclusions.transportation && data.transportation.map((t, i) => (
                <TransportSection key={`transport-${i}`} item={t} pricing={data.pricing} index={i} />
            ))}

            {/* 10. Additional Services / Custom Items */}
            {data.inclusions.customItems && data.customItems.length > 0 && (
                <div className="w-full min-h-screen bg-white p-16 page-break flex flex-col">
                    <h2 className="text-3xl font-bold text-[#1D4486] mb-12">Additional Services</h2>
                    <div className="border border-gray-200 p-8 rounded-xl bg-gray-50 space-y-8">
                        {data.customItems.map((item, i) => {
                            const { grandTotal } = calculatePriceBreakdown(item.unitPrice, data.pricing.markups.customItems, item.vatRule, data.pricing.vatPercent, item.quantity, item.days);
                            return (
                                <div key={i} className="flex justify-between items-center pb-8 border-b border-gray-200 last:border-0 last:pb-0">
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-gray-800">{item.description}</h3>
                                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mt-1">{item.days} Days • {item.quantity} Units</p>
                                    </div>
                                    <div className="text-4xl font-black text-[#1D4486]">{formatCurrency(grandTotal, data.pricing.currency)}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 7. Investment Summary - Accommodation (Loop) */}
            {data.inclusions.hotels && data.hotelOptions.map((h, i) => {
                const rows: any[] = [];
                h.roomTypes.forEach(r => {
                    const res = calculatePriceBreakdown(r.netPrice, data.pricing.markups.hotels, h.vatRule, data.pricing.vatPercent, r.quantity, r.numNights);
                    rows.push({ name: `Accommodation: ${h.name} - ${r.name}`, price: res.grandTotal / r.quantity, nights: r.numNights, qty: r.quantity, total: res.grandTotal });
                });
                h.meetingRooms.forEach(m => {
                    const res = calculatePriceBreakdown(m.price, data.pricing.markups.meetings, h.vatRule, data.pricing.vatPercent, m.quantity, m.days);
                    rows.push({ name: `Event: ${m.name}`, price: res.grandTotal / m.quantity, nights: m.days, qty: m.quantity, total: res.grandTotal });
                });
                h.dining.forEach(d => {
                    const res = calculatePriceBreakdown(d.price, data.pricing.markups.meetings, h.vatRule, data.pricing.vatPercent, d.quantity, d.days);
                    rows.push({ name: `Dining: ${d.name}`, price: res.grandTotal / d.quantity, nights: d.days, qty: d.quantity, total: res.grandTotal });
                });
                return <InvestmentSummarySection key={`inv-h-${i}`} title="Investment Summary" subtitle={`Accommodation Option ${i + 1}`} rows={rows} pricing={data.pricing} />;
            })}

            {/* 8. Investment Summary - Flight (Loop) */}
            {data.inclusions.flights && data.flightOptions.map((f, i) => {
                const rows: any[] = f.quotes.map(q => {
                    const res = calculatePriceBreakdown(q.price, data.pricing.markups.flights, f.vatRule, data.pricing.vatPercent, q.quantity, 1);
                    return { name: `${f.routeDescription} - ${q.class} Class`, price: res.grandTotal / q.quantity, nights: 1, qty: q.quantity, total: res.grandTotal };
                });
                return <InvestmentSummarySection key={`inv-f-${i}`} title="Investment Summary" subtitle={`Flight - Option ${i + 1}`} rows={rows} pricing={data.pricing} />;
            })}

            {/* 9. Thank You */}
            <ThankYouSection data={data} />
        </div>
    );
};

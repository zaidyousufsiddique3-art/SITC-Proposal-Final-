
import React from "react";
import {
    ProposalData,
    HotelDetails,
    MarkupType,
    VatRule,
    FlightDetails,
    FlightLeg,
    MarkupConfig,
} from "../types";

// ==============================
// THEME (match SITC PDFs)
// ==============================
const COLORS = {
    blue: "#1D4486",
    gold: "#CBA135",
    cream: "#F9F7F2",
    divider: "#E5E7EB",
    softCard: "#F6F8FB",
    ink: "#111827",
    muted: "#6B7280",
};

// ==============================
// HELPERS
// ==============================
const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
};

const safe = (v?: string | null, fallback = "-") => (v && v.trim() ? v : fallback);

const formatISOToHuman = (iso?: string) => {
    // accepts: YYYY-MM-DD
    if (!iso) return "TBD";
    const [y, m, d] = iso.split("-").map((x) => parseInt(x, 10));
    if (!y || !m || !d) return iso;
    const dt = new Date(y, m - 1, d);
    return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
};

const formatDateRangeHuman = (startISO?: string, endISO?: string) => {
    if (!startISO || !endISO) return "TBD";
    // e.g. "04 March 2026 - 18 March 2026"
    return `${formatISOToHuman(startISO)} - ${formatISOToHuman(endISO)}`;
};

const calculatePriceBreakdown = (
    net: number,
    markup: MarkupConfig,
    vatRule: VatRule,
    vatPercent: number = 15,
    quantity: number = 1,
    days: number = 1
) => {
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

    if (vatRule === "domestic") {
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

// ==============================
// PRINT PAGE WRAPPER (A4 feel)
// ==============================
const Page: React.FC<{
    children: React.ReactNode;
    bg?: string;
    className?: string;
}> = ({ children, bg = "#ffffff", className = "" }) => (
    <section
        className={`pdf-page relative mx-auto ${className}`}
        style={{
            width: "297mm",
            height: "209.8mm",
            background: bg,
            overflow: "hidden",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
        }}
    >
        {children}
    </section>
);

const SectionHeader: React.FC<{ title: string; subtitle?: string }> = ({
    title,
    subtitle,
}) => (
    <div style={{ padding: "30mm 25mm 10mm 25mm" }}>
        <div
            style={{
                fontSize: "36px",
                fontWeight: 800,
                color: COLORS.blue,
                marginBottom: "8px",
            }}
        >
            {title}
        </div>

        <div
            style={{
                width: "160px",
                height: "3px",
                background: COLORS.gold,
                marginBottom: "12px",
            }}
        />

        {subtitle && (
            <div
                style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: COLORS.gold,
                }}
            >
                {subtitle}
            </div>
        )}
    </div>
);

const SoftCard: React.FC<{ children: React.ReactNode; className?: string }> = ({
    children,
    className = "",
}) => (
    <div
        className={`rounded-[18px] border ${className}`}
        style={{
            background: COLORS.softCard,
            borderColor: "#E6EDF6",
            boxShadow: "0 6px 20px rgba(17,24,39,0.06)",
        }}
    >
        {children}
    </div>
);

// ==============================
// 1) OPENING (match Opening.pdf)
// ==============================
const OpeningSection: React.FC<{ data: ProposalData }> = ({ data }) => {
    // Best-effort derive date range from hotels, fallback to flights if needed
    let startISO: string | undefined;
    let endISO: string | undefined;

    if (data.hotelOptions?.length > 0) {
        const firstRT = data.hotelOptions[0]?.roomTypes?.[0];
        const lastRT = data.hotelOptions[data.hotelOptions.length - 1]?.roomTypes?.[0];
        startISO = firstRT?.checkIn;
        endISO = lastRT?.checkOut;
    } else if (data.flightOptions?.length > 0) {
        const f = data.flightOptions[0];
        startISO = f?.outbound?.[0]?.departureDate;
        endISO = f?.return?.[f.return.length - 1]?.arrivalDate;
    }

    const dateRange = formatDateRangeHuman(startISO, endISO);

    return (
        <Page bg="#ffffff">
            <div className="absolute inset-0 flex">
                {/* LEFT WHITE */}
                <div className="flex-1 bg-white" />
                {/* RIGHT CREAM */}
                <div className="w-[34%]" style={{ background: COLORS.cream }} />
            </div>

            {/* Content */}
            <div className="absolute inset-0 flex">
                <div className="flex-1 flex items-center">
                    {/* match the small centered title block (not huge hero) */}
                    <div className="pl-[90px]">
                        <div>
                            <div className="px-0 py-0">
                                <div
                                    className="text-[20px] font-extrabold leading-snug"
                                    style={{ color: COLORS.blue }}
                                >
                                    {safe(data.customerName)} | {dateRange}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Logo right */}
                <div className="w-[34%] flex items-center justify-center">
                    <div
                        className="bg-white border rounded-[2px] flex items-center justify-center"
                        style={{
                            width: 260,
                            height: 260,
                            borderColor: "#D7DEE8",
                        }}
                    >
                        {data.branding?.companyLogo ? (
                            <img
                                src={data.branding.companyLogo}
                                alt="Logo"
                                crossOrigin="anonymous"
                                style={{ maxWidth: "80%", maxHeight: "80%", objectFit: "contain" }}
                            />
                        ) : (
                            <div
                                className="text-center font-extrabold tracking-widest"
                                style={{ color: "#CBD5E1" }}
                            >
                                SITC
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Page>
    );
};

// ==============================
// 2) TERMS (match Terms and Conditions.pdf)
// ==============================
const TermsSection: React.FC = () => (
    <Page bg="#ffffff">
        <SectionHeader title="GENERAL TERMS & CONDITIONS" />

        <div className="px-[72px] pt-[36px]">
            <div className="grid grid-cols-2 gap-20 text-[13px] leading-relaxed" style={{ color: COLORS.ink }}>
                <div className="space-y-8">
                    <div>
                        <div className="font-extrabold" style={{ color: COLORS.blue }}>1. Booking Confirmation</div>
                        <p className="mt-2" style={{ color: COLORS.muted }}>
                            All bookings are subject to availability at the time of confirmation. Prices are subject
                            to change without prior notice until the final booking is secured.
                        </p>
                    </div>

                    <div>
                        <div className="font-extrabold" style={{ color: COLORS.blue }}>2. Payment Policy</div>
                        <p className="mt-2" style={{ color: COLORS.muted }}>
                            Full payment is required 14 days prior to arrival to guarantee the reservation. We
                            accept bank transfers and major credit cards.
                        </p>
                    </div>

                    <div>
                        <div className="font-extrabold" style={{ color: COLORS.blue }}>3. Cancellation Policy</div>
                        <p className="mt-2" style={{ color: COLORS.muted }}>
                            Cancellations made more than 30 days before arrival will incur no charges. Cancellations
                            between 14–30 days will be charged 50%. Cancellations within 14 days are non-refundable.
                        </p>
                    </div>
                </div>

                <div className="space-y-8">
                    <div>
                        <div className="font-extrabold" style={{ color: COLORS.blue }}>4. Flight Changes</div>
                        <p className="mt-2" style={{ color: COLORS.muted }}>
                            Flight schedules are subject to change by the airline. We are not responsible for delays
                            or cancellations by the carrier.
                        </p>
                    </div>

                    <div>
                        <div className="font-extrabold" style={{ color: COLORS.blue }}>5. Travel Documents</div>
                        <p className="mt-2" style={{ color: COLORS.muted }}>
                            Passengers are responsible for ensuring they have valid passports and visas for travel.
                        </p>
                    </div>

                    <div>
                        <div className="font-extrabold" style={{ color: COLORS.blue }}>6. Liability</div>
                        <p className="mt-2" style={{ color: COLORS.muted }}>
                            We act only as agents for the passenger in regard to travel, whether by railroad, motorcar,
                            motorcoach, boat, or airplane, and assume no liability for injury, damage, loss, accident,
                            delay, or irregularity.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </Page>
);

// ==============================
// 3) HOTEL PICTURE (match Hotel Picture.pdf)
// ==============================
const HotelPictureSection: React.FC<{ hotel: HotelDetails }> = ({ hotel }) => {
    const img0 = hotel.images?.[0]?.url;
    const img1 = hotel.images?.[1]?.url;
    const img2 = hotel.images?.[2]?.url;

    return (
        <Page bg="#ffffff">
            <SectionHeader title={safe(hotel.name)} />

            <div
                style={{
                    padding: "0 25mm",
                    height: "140mm",
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr",
                    gap: "10px",
                }}
            >
                {/* big left */}
                <div className="rounded-[6px] overflow-hidden bg-[#F3F4F6] border" style={{ borderColor: "#E5E7EB" }}>
                    {img0 ? (
                        <img src={img0} crossOrigin="anonymous" className="w-full h-full object-cover" alt="Hotel main" />
                    ) : null}
                </div>

                {/* right stacked */}
                <div className="flex flex-col gap-4">
                    <div className="flex-1 rounded-[6px] overflow-hidden bg-[#F3F4F6] border" style={{ borderColor: "#E5E7EB" }}>
                        {img1 ? <img src={img1} crossOrigin="anonymous" className="w-full h-full object-cover" alt="Hotel 2" /> : null}
                    </div>
                    <div className="flex-1 rounded-[6px] overflow-hidden bg-[#F3F4F6] border" style={{ borderColor: "#E5E7EB" }}>
                        {img2 ? <img src={img2} crossOrigin="anonymous" className="w-full h-full object-cover" alt="Hotel 3" /> : null}
                    </div>
                </div>
            </div>
        </Page>
    );
};

// ==============================
// 4) PROPERTY DETAILS (match Property.pdf)
// ==============================
const PropertyDetailsSection: React.FC<{
    hotel: HotelDetails;
    index: number;
    pricing: any;
}> = ({ hotel, index, pricing }) => {
    const rows: Array<{
        desc: string;
        unit: number;
        nights: number;
        qty: number;
        subTotal: number;
        vat: number;
        grand: number;
    }> = [];

    hotel.roomTypes?.forEach((rt) => {
        const res = calculatePriceBreakdown(
            rt.netPrice,
            pricing.markups.hotels,
            hotel.vatRule,
            pricing.vatPercent,
            rt.quantity,
            rt.numNights
        );

        rows.push({
            desc: `Accommodation: ${rt.name}`,
            unit: rt.netPrice,
            nights: rt.numNights,
            qty: rt.quantity,
            subTotal: res.subTotal,
            vat: res.vatAmount,
            grand: res.grandTotal,
        });
    });

    const grandTotal = rows.reduce((acc, r) => acc + r.grand, 0);

    return (
        <Page bg="#ffffff">
            <SectionHeader title="Property Details" subtitle={`Grand Total - Option ${index + 1}`} />

            <div
                style={{
                    padding: "0 25mm",
                    marginTop: "5mm",
                }}
            >
                <div className="border rounded-[8px] overflow-hidden" style={{ borderColor: "#E5E7EB" }}>
                    <table className="w-full text-[12px]">
                        <thead style={{ background: COLORS.blue, color: "#fff" }}>
                            <tr className="uppercase tracking-wider text-[11px]">
                                <th className="p-4 text-left">Service Description</th>
                                <th className="p-4 text-center">Unit price</th>
                                <th className="p-4 text-center">Nights</th>
                                <th className="p-4 text-center">Quantity</th>
                                <th className="p-4 text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: "#E5E7EB" }}>
                            {rows.map((r, i) => (
                                <tr key={i}>
                                    <td className="p-4">{r.desc}</td>
                                    <td className="p-4 text-center">{formatCurrency(r.unit, pricing.currency)}</td>
                                    <td className="p-4 text-center">{r.nights}</td>
                                    <td className="p-4 text-center">{r.qty}</td>
                                    <td className="p-4 text-right font-bold">{formatCurrency(r.grand, pricing.currency)}</td>
                                </tr>
                            ))}

                            <tr style={{ background: COLORS.blue, color: "#fff" }}>
                                <td colSpan={4} className="p-4 text-center font-extrabold uppercase tracking-widest">
                                    Final total
                                </td>
                                <td className="p-4 text-right font-extrabold">{formatCurrency(grandTotal, pricing.currency)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </Page>
    );
};

// ==============================
// 5) FLIGHT DETAILS (match Flight Details.pdf)
// ==============================
const FlightLegCard: React.FC<{
    label: string;
    leg: FlightLeg;
}> = ({ label, leg }) => (
    <div>
        <div className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: COLORS.muted }}>
            {label}
        </div>

        <div className="mt-4 flex items-center justify-between">
            <div className="text-[14px] font-extrabold" style={{ color: COLORS.blue }}>
                {safe(leg.airline)}{" "}
                <span className="font-semibold" style={{ color: COLORS.muted }}>
                    ({safe(leg.flightNumber)})
                </span>
            </div>
            <div className="text-[11px]" style={{ color: COLORS.muted }}>
                {safe(leg.duration)}
            </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-8">
            <div>
                <div className="text-[28px] font-black" style={{ color: COLORS.ink }}>
                    {safe(leg.from)}
                </div>
                <div className="mt-1 text-[12px] font-semibold" style={{ color: COLORS.muted }}>
                    {safe(leg.departureDate)} @ {safe(leg.departureTime)}
                </div>
            </div>

            <div className="text-right">
                <div className="text-[28px] font-black" style={{ color: COLORS.ink }}>
                    {safe(leg.to)}
                </div>
                <div className="mt-1 text-[12px] font-semibold" style={{ color: COLORS.muted }}>
                    {safe(leg.arrivalDate)} @ {safe(leg.arrivalTime)}
                </div>
            </div>
        </div>
    </div>
);

const FlightSection: React.FC<{ flight: FlightDetails; index: number; pricing: any }> = ({
    flight,
    index,
    pricing,
}) => {
    const routeTitle =
        flight?.outbound?.[0]?.from && flight?.outbound?.[flight.outbound.length - 1]?.to
            ? `${flight.outbound[0].from} to ${flight.outbound[flight.outbound.length - 1].to}`
            : "Flight Itinerary";

    const quotes = flight.quotes || [];

    // totals card like the PDF
    const totals = quotes.reduce(
        (acc, q) => {
            const res = calculatePriceBreakdown(
                q.price,
                pricing.markups.flights,
                flight.vatRule,
                pricing.vatPercent,
                q.quantity,
                1
            );
            acc.sub += res.subTotal;
            acc.vat += res.vatAmount;
            acc.grand += res.grandTotal;
            return acc;
        },
        { sub: 0, vat: 0, grand: 0 }
    );

    return (
        <Page bg="#ffffff">
            <SectionHeader title="Flight Itinerary" subtitle={`Grand Total - Option ${index + 1}`} />

            <div className="px-[72px] pt-[8px]">
                <SoftCard className="p-0 overflow-hidden">
                    <div className="flex">
                        {/* left gold bar */}
                        <div style={{ width: 5, background: COLORS.gold }} />
                        <div className="flex-1 px-10 py-6">
                            <div className="text-[26px] font-black" style={{ color: COLORS.ink }}>
                                {routeTitle}
                            </div>

                            <div className="mt-10 grid grid-cols-2 gap-14">
                                <div>
                                    {flight.outbound?.map((leg, i) => (
                                        <div key={i} className={i ? "mt-10" : ""}>
                                            <FlightLegCard label="OUTBOUND" leg={leg} />
                                        </div>
                                    ))}
                                </div>

                                <div>
                                    {flight.return?.map((leg, i) => (
                                        <div key={i} className={i ? "mt-10" : ""}>
                                            <FlightLegCard label="RETURN" leg={leg} />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total cost estimate box (like PDF) */}
                            <div className="mt-8" style={{ maxWidth: 400 }}>
                                <SoftCard className="px-6 py-4">
                                    <div className="text-[10px] font-extrabold uppercase tracking-widest" style={{ color: COLORS.muted }}>
                                        Total Cost Estimate
                                    </div>

                                    <div className="mt-4 space-y-2">
                                        {quotes.map((q, i) => (
                                            <div key={i} className="flex justify-between items-center">
                                                <div className="text-[11px] font-semibold" style={{ color: COLORS.muted }}>
                                                    {q.class} <span className="font-normal">({q.quantity} Seats)</span>
                                                </div>
                                                <div className="text-[12px] font-extrabold" style={{ color: COLORS.blue }}>
                                                    {formatCurrency(q.price * q.quantity, pricing.currency)}
                                                </div>
                                            </div>
                                        ))}

                                        <div className="pt-2 mt-2 border-t" style={{ borderColor: "#E5E7EB" }}>
                                            <div className="flex justify-between items-center">
                                                <div className="text-[12px] font-extrabold" style={{ color: COLORS.ink }}>
                                                    Total
                                                </div>
                                                <div className="text-[18px] font-black" style={{ color: COLORS.blue }}>
                                                    {formatCurrency(totals.grand, pricing.currency)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </SoftCard>
                            </div>
                        </div>
                    </div>
                </SoftCard>
            </div>
        </Page>
    );
};

// ==============================
// 6) INVESTMENT SUMMARY (match Investment Summary PDFs)
// ==============================
const InvestmentSummary: React.FC<{
    title: string;
    subtitle: string;
    rows: Array<{ name: string; price: number; nights: number; qty: number; subTotal: number; vat: number; grand: number }>;
    pricing: any;
}> = ({ title, subtitle, rows, pricing }) => {
    const totals = rows.reduce(
        (acc, r) => {
            acc.sub += r.subTotal;
            acc.vat += r.vat;
            acc.grand += r.grand;
            return acc;
        },
        { sub: 0, vat: 0, grand: 0 }
    );

    return (
        <Page bg="#ffffff">
            <SectionHeader title={title} subtitle={subtitle} />

            <div className="px-[72px] pt-[8px]">
                <div className="border rounded-[8px] overflow-hidden" style={{ borderColor: "#E5E7EB" }}>
                    <table className="w-full text-[12px]">
                        <thead style={{ background: COLORS.blue, color: "#fff" }}>
                            <tr className="uppercase tracking-wider text-[11px]">
                                <th className="p-4 text-left">Service Description</th>
                                <th className="p-4 text-center">Unit Price</th>
                                <th className="p-4 text-center">Nights/Days</th>
                                <th className="p-4 text-center">Quantity</th>
                                <th className="p-4 text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: "#E5E7EB" }}>
                            {rows.map((r, i) => (
                                <tr key={i}>
                                    <td className="p-4 font-semibold" style={{ color: COLORS.ink }}>{r.name}</td>
                                    <td className="p-4 text-center" style={{ color: COLORS.muted }}>
                                        {formatCurrency(r.price, pricing.currency)}
                                    </td>
                                    <td className="p-4 text-center" style={{ color: COLORS.muted }}>{r.nights}</td>
                                    <td className="p-4 text-center" style={{ color: COLORS.muted }}>{r.qty}</td>
                                    <td className="p-4 text-right font-extrabold" style={{ color: COLORS.ink }}>
                                        {formatCurrency(r.grand, pricing.currency)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals box bottom-right like the PDF */}
                <div
                    style={{
                        position: "absolute",
                        right: "25mm",
                        bottom: "25mm",
                        width: "90mm",
                    }}
                >
                    <SoftCard className="px-6 py-5" >
                        <div className="space-y-1.5 text-[10px]" style={{ minWidth: 240 }}>
                            <div className="flex justify-between" style={{ color: COLORS.muted }}>
                                <span className="font-semibold">Sub Total</span>
                                <span className="font-semibold">{formatCurrency(totals.sub, pricing.currency)}</span>
                            </div>
                            <div className="flex justify-between" style={{ color: COLORS.muted }}>
                                <span className="font-semibold">VAT ({pricing.vatPercent}%)</span>
                                <span className="font-semibold">{formatCurrency(totals.vat, pricing.currency)}</span>
                            </div>

                            <div className="mt-3 pt-3 border-t" style={{ borderColor: "#E5E7EB" }}>
                                <div className="flex items-end justify-between">
                                    <div className="text-[14px] font-black" style={{ color: COLORS.blue }}>
                                        Grand Total
                                    </div>
                                    <div className="text-[20px] font-black" style={{ color: COLORS.blue }}>
                                        {formatCurrency(totals.grand, pricing.currency)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SoftCard>
                </div>
            </div>
        </Page>
    );
};

// ==============================
// 7) ADDITIONAL SERVICES (match Additional Services.pdf)
// ==============================
const AdditionalServicesSection: React.FC<{ title?: string; items: Array<{ name: string; days?: number; qty?: number; total: number }>; pricing: any }> = ({
    title = "Additional Services",
    items,
    pricing,
}) => {
    if (!items?.length) return null;

    return (
        <Page bg="#ffffff">
            <SectionHeader title={title} />

            <div className="px-[72px] pt-[40px]">
                {items.map((it, i) => (
                    <SoftCard key={i} className="px-10 py-10 mb-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="text-[18px] font-black" style={{ color: COLORS.ink }}>
                                    {it.name}
                                </div>
                                <div className="mt-2 text-[12px] font-semibold" style={{ color: COLORS.muted }}>
                                    {it.days ? `${it.days} Day(s)` : ""}{it.days && it.qty ? " • " : ""}{it.qty ? `${it.qty} Unit(s)` : ""}
                                </div>
                            </div>

                            <div className="text-[18px] font-black" style={{ color: COLORS.blue }}>
                                {formatCurrency(it.total, pricing.currency)}
                            </div>
                        </div>
                    </SoftCard>
                ))}
            </div>
        </Page>
    );
};

// ==============================
// 8) TRANSPORTATION (match Transportation.pdf)
// ==============================
const TransportationSection: React.FC<{ t: any; pricing: any }> = ({ t, pricing }) => {
    const res = calculatePriceBreakdown(
        t.netPricePerDay,
        pricing.markups.transportation,
        t.vatRule,
        pricing.vatPercent,
        t.quantity,
        t.days
    );

    return (
        <Page bg="#ffffff">
            <SectionHeader title="Transportation" />

            <div className="px-[72px] pt-[10px] flex flex-col items-center">
                <div>
                    {t.image ? (
                        <img
                            src={t.image}
                            alt="Vehicle"
                            crossOrigin="anonymous"
                            style={{ width: 440, height: 240, objectFit: "contain" }}
                        />
                    ) : (
                        <div className="w-[440px] h-[240px] bg-gray-100 flex items-center justify-center text-gray-400">No vehicle image</div>
                    )}
                </div>

                <div className="mt-6 text-center">
                    <div className="text-[20px] font-black" style={{ color: COLORS.ink }}>
                        {safe(t.model)}
                    </div>
                    <div className="mt-1 text-[11px] font-semibold" style={{ color: COLORS.muted }}>
                        {safe(t.type)} • {safe(t.description)}
                    </div>
                </div>

                <div className="mt-8 w-full flex justify-center">
                    <SoftCard className="px-8 py-4" >
                        <div className="text-center">
                            <div className="text-[24px] font-black" style={{ color: COLORS.blue }}>
                                {formatCurrency(res.grandTotal, pricing.currency)}
                            </div>
                            <div className="mt-1 text-[11px] font-semibold" style={{ color: COLORS.muted }}>
                                {t.quantity} Vehicle(s) × {t.days} Day(s)
                            </div>
                        </div>
                    </SoftCard>
                </div>
            </div>
        </Page>
    );
};

// ==============================
// 9) THANK YOU (match Thank you!.pdf)
// ==============================
const ThankYouSection: React.FC<{ data: ProposalData }> = ({ data }) => (
    <Page bg={COLORS.blue}>
        {/* subtle diagonal pattern */}
        <div
            className="absolute inset-0 opacity-[0.14]"
            style={{
                backgroundImage:
                    "repeating-linear-gradient(45deg, rgba(255,255,255,0.00), rgba(255,255,255,0.00) 18px, rgba(255,255,255,0.18) 18px, rgba(255,255,255,0.18) 36px)",
            }}
        />

        <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <div className="text-[64px] font-black tracking-tight">Thank You</div>

            <div className="mt-6 text-[14px] text-white/70 max-w-[520px] text-center leading-relaxed">
                We appreciate the opportunity to propose these services for you. We look forward to
                creating an unforgettable experience.
            </div>

            <div className="mt-10" style={{ width: 72, height: 4, background: COLORS.gold, borderRadius: 999 }} />

            <div className="mt-14 rounded-[18px] border border-white/20 bg-white/5 backdrop-blur-sm px-12 py-10 text-center">
                <div className="text-[22px] font-black">{safe(data.branding?.contactName || data.branding?.companyName || "SITC")}</div>
                <div className="mt-2 text-[14px] text-white/70">{safe(data.branding?.contactEmail)}</div>
                <div className="mt-6 text-[12px] tracking-widest uppercase text-white/40">www.sitc.com.sa</div>
            </div>
        </div>
    </Page>
);

// ==============================
// MAIN WRAPPER
// ==============================
export const ProposalPDF: React.FC<{ data: ProposalData }> = ({ data }) => {
    const pricing = data.pricing || {
        currency: 'SAR',
        enableVat: true,
        vatPercent: 15,
        markups: {
            hotels: { type: MarkupType.Fixed, value: 0 },
            meetings: { type: MarkupType.Fixed, value: 0 },
            flights: { type: MarkupType.Fixed, value: 0 },
            transportation: { type: MarkupType.Fixed, value: 0 },
            activities: { type: MarkupType.Fixed, value: 0 },
            customItems: { type: MarkupType.Fixed, value: 0 }
        },
        showPrices: true
    };

    return (
        <div
            id="proposal-pdf-root"
            className="font-sans text-gray-900 bg-white"
            style={{ margin: 0, padding: 0, width: '297mm' }}
        >
            {/* print rules */}
            <style>{`
  @page {
    size: A4 landscape;
    margin: 0;
  }

  html, body {
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
    background: #ffffff;
  }

  .pdf-page {
    width: 297mm !important;
    height: 209.8mm !important;
    overflow: hidden !important;
    position: relative;
    box-sizing: border-box !important;
    margin: 0 !important;
    padding: 0 !important;

    /* Prevent any internal breaks */
    page-break-inside: avoid !important;
    break-inside: avoid-page !important;
  }

  /* Force new page for sections, but only if they are not the first child */
  .pdf-page + .pdf-page {
    page-break-before: always !important;
    break-before: page !important;
  }
`}</style>

            <OpeningSection data={data} />
            <TermsSection />

            {/* HOTELS */}
            {data.inclusions?.hotels &&
                (data.hotelOptions || []).map((h, i) => (
                    <React.Fragment key={`hotel-pages-${i}`}>
                        <HotelPictureSection hotel={h} />
                        <PropertyDetailsSection hotel={h} index={i} pricing={pricing} />
                    </React.Fragment>
                ))}

            {/* FLIGHTS */}
            {data.inclusions?.flights &&
                (data.flightOptions || []).map((f, i) => (
                    <FlightSection key={`flight-${i}`} flight={f} index={i} pricing={pricing} />
                ))}

            {/* TRANSPORTATION */}
            {(data.transportation || []).map((t, i) => (
                <TransportationSection key={`trans-${i}`} t={t} pricing={pricing} />
            ))}

            {/* INVESTMENT SUMMARIES (REORDERED) */}

            {/* 1. Accommodation Summaries */}
            {data.inclusions?.hotels && (data.hotelOptions || []).map((h, i) => {
                const rows = (h.roomTypes || []).map((r) => {
                    const res = calculatePriceBreakdown(
                        r.netPrice,
                        pricing.markups.hotels,
                        h.vatRule,
                        pricing.vatPercent,
                        r.quantity,
                        r.numNights
                    );
                    return {
                        name: `${h.name} - ${r.name}`,
                        price: r.netPrice,
                        nights: r.numNights,
                        qty: r.quantity,
                        subTotal: res.subTotal,
                        vat: res.vatAmount,
                        grand: res.grandTotal,
                    };
                });
                return (
                    <InvestmentSummary
                        key={`inv-hotel-${i}`}
                        title="Investment Summary"
                        subtitle={`Accommodation Option ${i + 1}`}
                        pricing={pricing}
                        rows={rows}
                    />
                );
            })}

            {/* 2. Flight Summaries */}
            {data.inclusions?.flights && (data.flightOptions || []).map((f, i) => {
                const rows = (f.quotes || []).map((q) => {
                    const res = calculatePriceBreakdown(
                        q.price,
                        pricing.markups.flights,
                        f.vatRule,
                        pricing.vatPercent,
                        q.quantity,
                        1
                    );
                    const route = f?.outbound?.[0]?.from && f?.outbound?.[f.outbound.length - 1]?.to
                        ? `${f.outbound[0].from} to ${f.outbound[f.outbound.length - 1].to}`
                        : "Flight";

                    return {
                        name: `${route} - ${q.class}`,
                        price: q.price,
                        nights: 1,
                        qty: q.quantity,
                        subTotal: res.subTotal,
                        vat: res.vatAmount,
                        grand: res.grandTotal,
                    };
                });
                return (
                    <InvestmentSummary
                        key={`inv-flight-${i}`}
                        title="Investment Summary"
                        subtitle={`Flight - Option ${i + 1}`}
                        pricing={pricing}
                        rows={rows}
                    />
                );
            })}

            {/* 3. Transportation Summaries */}
            {data.inclusions?.transportation && (data.transportation || []).length > 0 && (data.transportation || []).map((t, i) => {
                const res = calculatePriceBreakdown(
                    t.netPricePerDay,
                    pricing.markups.transportation,
                    t.vatRule,
                    pricing.vatPercent,
                    t.quantity,
                    t.days
                );
                return (
                    <InvestmentSummary
                        key={`inv-trans-${i}`}
                        title="Investment Summary"
                        subtitle={`Transportation - ${t.model}`}
                        pricing={pricing}
                        rows={[{
                            name: `${t.model} (${t.type})`,
                            price: t.netPricePerDay,
                            nights: t.days,
                            qty: t.quantity,
                            subTotal: res.subTotal,
                            vat: res.vatAmount,
                            grand: res.grandTotal
                        }]}
                    />
                );
            })}

            {/* ADDITIONAL SERVICES */}
            {data.inclusions?.customItems && (data.customItems || []).length > 0 && (
                <AdditionalServicesSection
                    items={(data.customItems || []).map(item => {
                        const res = calculatePriceBreakdown(
                            item.unitPrice,
                            pricing.markups.customItems,
                            item.vatRule,
                            pricing.vatPercent,
                            item.quantity,
                            item.days
                        );
                        return {
                            name: item.description,
                            days: item.days,
                            qty: item.quantity,
                            total: res.grandTotal
                        };
                    })}
                    pricing={pricing}
                />
            )}

            {data.inclusions?.activities && (data.activities || []).length > 0 && (
                <AdditionalServicesSection
                    title="Activities & Tours"
                    items={(data.activities || []).map(item => {
                        const res = calculatePriceBreakdown(
                            item.pricePerPerson,
                            pricing.markups.activities,
                            item.vatRule,
                            pricing.vatPercent,
                            item.guests,
                            item.days
                        );
                        return {
                            name: item.name,
                            days: item.days,
                            qty: item.guests,
                            total: res.grandTotal
                        };
                    })}
                    pricing={pricing}
                />
            )}

            <ThankYouSection data={data} />
        </div>
    );
};

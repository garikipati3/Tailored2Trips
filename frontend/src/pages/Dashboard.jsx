import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import TopBar from "../components/TopBar";
import PlaceSearch from "../components/PlaceSearch";
import fetcher from "../utils/fetcher";

const flightDeals = [
  {
    id: "FLT001",
    airline: "SkyLink Airways",
    from: "JFK",
    fromCity: "New York",
    to: "CDG",
    toCity: "Paris",
    departTime: "08:20",
    arriveTime: "21:55",
    duration: "7h 35m",
    price: 680,
    stops: 0,
    cabin: "Premium Economy",
    baggage: "1 checked bag",
    co2: 42,
    perks: ["Wi-Fi", "Seat selection", "Carbon offset included"],
    place: {
      name: "Charles de Gaulle Airport",
      address: "Paris, France",
      lat: 49.0097,
      lng: 2.5479,
    },
  },
  {
    id: "FLT002",
    airline: "Aurora Air",
    from: "SFO",
    fromCity: "San Francisco",
    to: "NRT",
    toCity: "Tokyo",
    departTime: "13:10",
    arriveTime: "18:05",
    duration: "11h 55m",
    price: 940,
    stops: 1,
    cabin: "Economy Flex",
    baggage: "2 checked bags",
    co2: 58,
    perks: ["USB power", "Flexible ticket"],
    place: {
      name: "Narita International Airport",
      address: "Tokyo, Japan",
      lat: 35.7653,
      lng: 140.3853,
    },
  },
  {
    id: "FLT003",
    airline: "Pacific Connect",
    from: "LAX",
    fromCity: "Los Angeles",
    to: "SYD",
    toCity: "Sydney",
    departTime: "22:45",
    arriveTime: "07:20",
    duration: "15h 35m",
    price: 1220,
    stops: 0,
    cabin: "Business Saver",
    baggage: "2 checked bags",
    co2: 63,
    perks: ["Lie-flat seat", "Lounge access"],
    place: {
      name: "Sydney Kingsford Smith Airport",
      address: "Sydney, Australia",
      lat: -33.9399,
      lng: 151.1753,
    },
  },
];

const stayOptions = [
  {
    id: "STY01",
    name: "Luxe Seine Hotel",
    location: "Le Marais, Paris",
    city: "Paris",
    pricePerNight: 195,
    nights: 5,
    rating: 4.8,
    amenities: ["Breakfast included", "Rooftop bar", "Co-working desk"],
    walkScore: 92,
    place: {
      name: "Luxe Seine Hotel",
      address: "10 Rue de Poitou, 75003 Paris, France",
      lat: 48.8625,
      lng: 2.3622,
    },
  },
  {
    id: "STY02",
    name: "Shibuya Nest",
    location: "Shibuya, Tokyo",
    city: "Tokyo",
    pricePerNight: 150,
    nights: 6,
    rating: 4.6,
    amenities: ["Onsen spa", "Tea ceremony", "Laundry"],
    walkScore: 95,
    place: {
      name: "Shibuya Nest",
      address: "2-24-12 Shibuya, Tokyo 150-0002, Japan",
      lat: 35.6595,
      lng: 139.7005,
    },
  },
  {
    id: "STY03",
    name: "Bondi Breeze Suites",
    location: "Bondi Beach, Sydney",
    city: "Sydney",
    pricePerNight: 210,
    nights: 4,
    rating: 4.7,
    amenities: ["Ocean view", "Kitchenette", "Surfboard rental"],
    walkScore: 89,
    place: {
      name: "Bondi Breeze Suites",
      address: "178 Campbell Parade, Bondi Beach NSW 2026, Australia",
      lat: -33.8908,
      lng: 151.2743,
    },
  },
];

const experienceCategories = [
  { id: "all", label: "All experiences" },
  { id: "culture", label: "Culture & History" },
  { id: "adventure", label: "Adventure" },
  { id: "culinary", label: "Food & Drink" },
  { id: "wellness", label: "Wellness" },
];

const experienceOptions = [
  {
    id: "EXP01",
    title: "Sunset Seine Cruise & Degustation",
    location: "Paris, France",
    category: "culinary",
    duration: "2h",
    price: 110,
    highlights: ["Chef curated menu", "Live jazz", "Panoramic deck"],
    place: {
      name: "Port de la Bourdonnais",
      address: "Port de la Bourdonnais, 75007 Paris, France",
      lat: 48.8619,
      lng: 2.3053,
    },
  },
  {
    id: "EXP02",
    title: "Mt. Fuji Guided Hike",
    location: "Shizuoka, Japan",
    category: "adventure",
    duration: "8h",
    price: 180,
    highlights: ["Small group", "Gear rental", "Sunrise summit"],
    place: {
      name: "5th Station Mt. Fuji",
      address: "Fujinomiya, Shizuoka, Japan",
      lat: 35.3675,
      lng: 138.7324,
    },
  },
  {
    id: "EXP03",
    title: "Coastal E-Bike & Coffee Crawl",
    location: "Sydney, Australia",
    category: "wellness",
    duration: "3h",
    price: 95,
    highlights: ["Local roastery tasting", "Cliffside views", "Wellness stops"],
    place: {
      name: "Circular Quay Wharf 6",
      address: "Sydney NSW, Australia",
      lat: -33.8612,
      lng: 151.2106,
    },
  },
  {
    id: "EXP04",
    title: "Tokyo Night Food Safari",
    location: "Tokyo, Japan",
    category: "culinary",
    duration: "4h",
    price: 130,
    highlights: ["6 tasting stops", "Craft cocktails", "Local guide"],
    place: {
      name: "Shinjuku Station East Exit",
      address: "Shinjuku, Tokyo, Japan",
      lat: 35.6905,
      lng: 139.7023,
    },
  },
];

const calculateTripDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );
};

const formatDateRange = (start, end) => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  });

  return `${formatter.format(new Date(start))} – ${formatter.format(
    new Date(end)
  )}`;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [flightFilters, setFlightFilters] = useState({
    from: "",
    to: "",
    maxPrice: "",
    nonstopOnly: false,
  });
  const [stayFilters, setStayFilters] = useState({
    location: "",
    maxNightly: "",
  });
  const [experienceFilters, setExperienceFilters] = useState({
    category: "all",
    maxPrice: "",
    search: "",
  });
  const [modalConfig, setModalConfig] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [profileRes, tripsRes] = await Promise.all([
          fetcher("/api/user/profile"),
          fetcher("/api/trip?limit=50"),
        ]);

        if (profileRes.success) {
          setProfile(profileRes.data);
        }

        if (tripsRes.success) {
          setTrips(tripsRes.data.trips);
          if (tripsRes.data.trips.length > 0) {
            const sorted = [...tripsRes.data.trips].sort(
              (a, b) => new Date(a.startDate) - new Date(b.startDate)
            );
            setSelectedTripId(sorted[0].id);
          }
        }
      } catch (error) {
        console.error("Dashboard load error:", error);
        toast.error("Unable to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const selectedTrip = useMemo(
    () => trips.find((trip) => trip.id === selectedTripId),
    [selectedTripId, trips]
  );

  const tripStats = useMemo(() => {
    const upcoming = trips.filter(
      (trip) => new Date(trip.startDate) > new Date()
    );
    const completed = trips.filter(
      (trip) => new Date(trip.endDate) < new Date()
    );
    const activeMembers = trips.reduce(
      (sum, trip) => sum + trip.members.length,
      0
    );
    const totalBudget = trips.reduce(
      (sum, trip) => sum + (trip.budget || 0),
      0
    );

    return {
      totalTrips: trips.length,
      upcomingTrips: upcoming.length,
      completedTrips: completed.length,
      activeMembers,
      totalBudget,
    };
  }, [trips]);

  const filteredFlights = useMemo(() => {
    return flightDeals.filter((flight) => {
      if (
        flightFilters.from &&
        !flight.from.toLowerCase().includes(flightFilters.from.toLowerCase())
      ) {
        return false;
      }
      if (
        flightFilters.to &&
        !flight.to.toLowerCase().includes(flightFilters.to.toLowerCase())
      ) {
        return false;
      }
      if (
        flightFilters.maxPrice &&
        flight.price > Number(flightFilters.maxPrice)
      ) {
        return false;
      }
      if (flightFilters.nonstopOnly && flight.stops > 0) {
        return false;
      }
      return true;
    });
  }, [flightFilters]);

  const filteredStays = useMemo(() => {
    return stayOptions.filter((stay) => {
      if (
        stayFilters.location &&
        !stay.location.toLowerCase().includes(stayFilters.location.toLowerCase())
      ) {
        return false;
      }
      if (
        stayFilters.maxNightly &&
        stay.pricePerNight > Number(stayFilters.maxNightly)
      ) {
        return false;
      }
      return true;
    });
  }, [stayFilters]);

  const filteredExperiences = useMemo(() => {
    return experienceOptions.filter((exp) => {
      if (
        experienceFilters.category !== "all" &&
        exp.category !== experienceFilters.category
      ) {
        return false;
      }
      if (
        experienceFilters.maxPrice &&
        exp.price > Number(experienceFilters.maxPrice)
      ) {
        return false;
      }
      if (
        experienceFilters.search &&
        !exp.title
          .toLowerCase()
          .includes(experienceFilters.search.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [experienceFilters]);

  const handleOpenModal = (type, item) => {
    if (!selectedTripId) {
      toast.error("Create a trip first so we know where to save this item.");
      return;
    }

    const defaults = buildPlanDefaults(type, item);
    setModalConfig({
      type,
      defaults,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <TopBar />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <TopBar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Welcome back</p>
                <h1 className="text-3xl font-semibold text-slate-900 mt-1">
                  {profile?.fullName || "Traveler"}
                </h1>
                <p className="text-slate-500 mt-2">
                  {selectedTrip
                    ? `Planning ${selectedTrip.destination} • ${formatDateRange(
                        selectedTrip.startDate,
                        selectedTrip.endDate
                      )}`
                    : "Create a trip to unlock the planner."}
                </p>
              </div>
              {trips.length > 0 && (
                <div className="flex flex-col">
                  <label className="text-xs font-semibold text-slate-500 uppercase mb-1">
                    Active Trip
                  </label>
                  <select
                    value={selectedTripId || ""}
                    onChange={(e) => setSelectedTripId(e.target.value)}
                    className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {trips.map((trip) => (
                      <option key={trip.id} value={trip.id}>
                        {trip.title} · {trip.destination}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <button
                onClick={() => navigate("/trips")}
                className="rounded-xl border border-slate-200 px-4 py-3 text-left hover:border-blue-500 hover:shadow-sm transition"
              >
                <p className="text-xs uppercase text-slate-500">Trips</p>
                <p className="text-base font-semibold text-slate-900">
                  Manage itineraries
                </p>
              </button>
              <button
                onClick={() =>
                  selectedTrip
                    ? navigate(`/trips/${selectedTrip.id}/itinerary`)
                    : toast.info("Pick a trip to jump into the itinerary.")
                }
                className="rounded-xl border border-slate-200 px-4 py-3 text-left hover:border-blue-500 hover:shadow-sm transition"
              >
                <p className="text-xs uppercase text-slate-500">Itinerary</p>
                <p className="text-base font-semibold text-slate-900">
                  Day-by-day planner
                </p>
              </button>
              <button
                onClick={() =>
                  selectedTrip
                    ? navigate(`/trips/${selectedTrip.id}/budget`)
                    : toast.info("Select a trip to open the budget view.")
                }
                className="rounded-xl border border-slate-200 px-4 py-3 text-left hover:border-blue-500 hover:shadow-sm transition"
              >
                <p className="text-xs uppercase text-slate-500">Budget</p>
                <p className="text-base font-semibold text-slate-900">
                  Track spend
                </p>
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl text-white p-6 shadow-sm">
            <p className="text-sm uppercase tracking-wide text-blue-100">
              Trip momentum
            </p>
            <h2 className="text-3xl font-semibold mt-2">
              {tripStats.totalTrips} trips
            </h2>
            <p className="text-blue-100 mt-1">
              {tripStats.upcomingTrips} upcoming · {tripStats.completedTrips}{" "}
              completed
            </p>
            <div className="mt-6 space-y-2 text-sm">
              <p>Active collaborators: {tripStats.activeMembers}</p>
              <p>
                Planned budget: $
                {tripStats.totalBudget.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                })}
              </p>
            </div>
            <button
              onClick={() => navigate("/trips")}
              className="mt-6 w-full bg-white/10 border border-white/30 backdrop-blur px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 transition"
            >
              View trip board
            </button>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase text-slate-500">Flight Deals</p>
                <h3 className="text-xl font-semibold text-slate-900">
                  Smart fare picks
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-40">
                  <PlaceSearch
                    useAutocomplete
                    placeholder="From"
                    className="text-sm"
                    inputClassName="h-10"
                    onPlaceSelect={(place) =>
                      setFlightFilters((prev) => ({ ...prev, from: place.name }))
                    }
                  />
                </div>
                <div className="w-40">
                  <PlaceSearch
                    useAutocomplete
                    placeholder="To"
                    className="text-sm"
                    inputClassName="h-10"
                    onPlaceSelect={(place) =>
                      setFlightFilters((prev) => ({ ...prev, to: place.name }))
                    }
                  />
                </div>
                <input
                  type="number"
                  placeholder="Max $"
                  value={flightFilters.maxPrice}
                  onChange={(e) =>
                    setFlightFilters((prev) => ({
                      ...prev,
                      maxPrice: e.target.value,
                    }))
                  }
                  className="w-24 h-10 border border-slate-200 rounded-lg px-2 text-sm"
                />
                <label className="h-10 flex items-center gap-1 text-xs text-slate-500">
                  <input
                    type="checkbox"
                    checked={flightFilters.nonstopOnly}
                    onChange={(e) =>
                      setFlightFilters((prev) => ({
                        ...prev,
                        nonstopOnly: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-blue-600 rounded border-slate-300"
                  />
                  Nonstop
                </label>
              </div>
            </div>
            <div className="space-y-4">
              {filteredFlights.map((flight) => (
                <div
                  key={flight.id}
                  className="border border-slate-100 rounded-xl p-4 hover:border-blue-200 hover:shadow-sm transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">
                        {flight.airline} · {flight.cabin}
                      </p>
                      <p className="text-lg font-semibold text-slate-900">
                        {flight.from} → {flight.to}
                      </p>
                      <p className="text-sm text-slate-500">
                        {flight.departTime} — {flight.arriveTime} ·{" "}
                        {flight.duration}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                        {flight.perks.map((perk) => (
                          <span
                            key={perk}
                            className="px-2 py-1 rounded-full bg-slate-100"
                          >
                            {perk}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold text-slate-900">
                        ${flight.price}
                      </p>
                      <p className="text-xs text-slate-500">
                        {flight.stops === 0 ? "Nonstop" : `${flight.stops} stop`}
                      </p>
                      <button
                        onClick={() => handleOpenModal("flight", flight)}
                        className="mt-3 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
                      >
                        Add flight
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase text-slate-500">Stays</p>
                <h3 className="text-xl font-semibold text-slate-900">
                  Comfort picks
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Neighborhood"
                  value={stayFilters.location}
                  onChange={(e) =>
                    setStayFilters((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  className="w-28 border border-slate-200 rounded-lg px-2 py-1 text-sm"
                />
                <input
                  type="number"
                  placeholder="Nightly $"
                  value={stayFilters.maxNightly}
                  onChange={(e) =>
                    setStayFilters((prev) => ({
                      ...prev,
                      maxNightly: e.target.value,
                    }))
                  }
                  className="w-24 border border-slate-200 rounded-lg px-2 py-1 text-sm"
                />
              </div>
            </div>
            <div className="space-y-4">
              {filteredStays.map((stay) => (
                <div
                  key={stay.id}
                  className="border border-slate-100 rounded-xl p-4 hover:border-blue-200 hover:shadow-sm transition"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">{stay.location}</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {stay.name}
                      </p>
                      <p className="text-sm text-slate-500">
                        {stay.nights} nights · Walk score {stay.walkScore}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                        {stay.amenities.map((perk) => (
                          <span
                            key={perk}
                            className="px-2 py-1 rounded-full bg-slate-100"
                          >
                            {perk}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold text-slate-900">
                        ${stay.pricePerNight}
                      </p>
                      <p className="text-xs text-slate-500">per night</p>
                      <button
                        onClick={() => handleOpenModal("stay", stay)}
                        className="mt-3 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition"
                      >
                        Add stay
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase text-slate-500">Experiences</p>
              <h3 className="text-2xl font-semibold text-slate-900">
                Curated activities
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={experienceFilters.category}
                onChange={(e) =>
                  setExperienceFilters((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
              >
                {experienceCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Max price"
                value={experienceFilters.maxPrice}
                onChange={(e) =>
                  setExperienceFilters((prev) => ({
                    ...prev,
                    maxPrice: e.target.value,
                  }))
                }
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Search title"
                value={experienceFilters.search}
                onChange={(e) =>
                  setExperienceFilters((prev) => ({
                    ...prev,
                    search: e.target.value,
                  }))
                }
                className="border border-slate-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredExperiences.map((exp) => (
              <div
                key={exp.id}
                className="border border-slate-100 rounded-xl p-4 flex flex-col justify-between hover:border-blue-200 hover:shadow-sm transition"
              >
                <div>
                  <p className="text-xs uppercase text-slate-500">
                    {exp.location}
                  </p>
                  <h4 className="text-lg font-semibold text-slate-900 mt-1">
                    {exp.title}
                  </h4>
                  <p className="text-sm text-slate-500">
                    {exp.duration} · {exp.category}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                    {exp.highlights.map((highlight) => (
                      <span
                        key={highlight}
                        className="px-2 py-1 rounded-full bg-slate-100"
                      >
                        {highlight}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-semibold text-slate-900">
                      ${exp.price}
                    </p>
                    <p className="text-xs text-slate-500">per traveler</p>
                  </div>
                  <button
                    onClick={() => handleOpenModal("experience", exp)}
                    className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition"
                  >
                    Add activity
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {modalConfig && selectedTrip && (
        <PlanSelectionModal
          config={modalConfig}
          trips={trips}
          defaultTripId={selectedTripId}
          onClose={() => setModalConfig(null)}
          onSuccess={() => setModalConfig(null)}
        />
      )}
    </div>
  );
};

const buildPlanDefaults = (type, item) => {
  if (type === "flight") {
    return {
      title: `${item.airline} ${item.from} → ${item.to}`,
      description: `${item.cabin} cabin · ${item.duration} · ${
        item.stops === 0 ? "Nonstop" : `${item.stops} stop`
      }`,
      category: "TRANSPORTATION",
      estimatedCost: item.price,
      startTime: item.departTime,
      endTime: item.arriveTime,
      notes: item.perks.join(", "),
      placeName: item.place.name,
      placeAddress: item.place.address,
      placeLatitude: item.place.lat,
      placeLongitude: item.place.lng,
    };
  }

  if (type === "stay") {
    return {
      title: item.name,
      description: `${item.location} • ${item.nights} nights`,
      category: "ACCOMMODATION",
      estimatedCost: item.pricePerNight * item.nights,
      startTime: "15:00",
      endTime: "11:00",
      notes: item.amenities.join(", "),
      placeName: item.place.name,
      placeAddress: item.place.address,
      placeLatitude: item.place.lat,
      placeLongitude: item.place.lng,
    };
  }

  return {
    title: item.title,
    description: `${item.location} • ${item.duration}`,
    category: "ACTIVITY",
    estimatedCost: item.price,
    startTime: "09:00",
    endTime: "",
    notes: item.highlights.join(", "),
    placeName: item.place.name,
    placeAddress: item.place.address,
    placeLatitude: item.place.lat,
    placeLongitude: item.place.lng,
  };
};

const PlanSelectionModal = ({ config, trips, defaultTripId, onClose, onSuccess }) => {
  const [formState, setFormState] = useState({
    tripId: defaultTripId || trips[0]?.id || "",
    day: 1,
    startTime: config.defaults.startTime || "",
    endTime: config.defaults.endTime || "",
    notes: config.defaults.notes || "",
  });
  const [saving, setSaving] = useState(false);

  const activeTrip = useMemo(
    () => trips.find((trip) => trip.id === formState.tripId),
    [formState.tripId, trips]
  );

  useEffect(() => {
    if (activeTrip) {
      setFormState((prev) => ({
        ...prev,
        day: Math.min(prev.day, calculateTripDays(activeTrip.startDate, activeTrip.endDate)),
      }));
    }
  }, [activeTrip]);

  const dayCount = activeTrip
    ? calculateTripDays(activeTrip.startDate, activeTrip.endDate)
    : 1;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formState.tripId) {
      toast.error("Select a trip first");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        day: formState.day,
        title: config.defaults.title,
        description: config.defaults.description,
        category: config.defaults.category,
        estimatedCost: config.defaults.estimatedCost,
        notes: formState.notes,
        startTime: formState.startTime,
        endTime: formState.endTime,
        placeName: config.defaults.placeName,
        placeAddress: config.defaults.placeAddress,
        placeLatitude: config.defaults.placeLatitude,
        placeLongitude: config.defaults.placeLongitude,
      };

      const response = await fetcher(
        `/api/itinerary/trip/${formState.tripId}/items`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.success) {
        toast.error(response.message || "Unable to save item");
        return;
      }

      toast.success("Added to itinerary");
      onSuccess();
    } catch (error) {
      console.error("Plan add error:", error);
      toast.error("Unable to save item");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl border border-slate-100">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase text-slate-500">Add to itinerary</p>
              <h3 className="text-xl font-semibold text-slate-900">
                {config.defaults.title}
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                {config.defaults.description}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition"
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">
              Trip
            </label>
            <select
              value={formState.tripId}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, tripId: e.target.value }))
              }
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {trips.map((trip) => (
                <option key={trip.id} value={trip.id}>
                  {trip.title} · {trip.destination}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">
                Day
              </label>
              <select
                value={formState.day}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    day: Number(e.target.value),
                  }))
                }
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Array.from({ length: dayCount }, (_, idx) => (
                  <option key={idx + 1} value={idx + 1}>
                    Day {idx + 1}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">
                Estimated cost
              </label>
              <p className="mt-2 font-semibold text-slate-900">
                ${config.defaults.estimatedCost?.toLocaleString() || 0}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">
                Start time
              </label>
              <input
                type="time"
                value={formState.startTime || ""}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    startTime: e.target.value,
                  }))
                }
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase">
                End time
              </label>
              <input
                type="time"
                value={formState.endTime || ""}
                onChange={(e) =>
                  setFormState((prev) => ({
                    ...prev,
                    endTime: e.target.value,
                  }))
                }
                className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase">
              Notes
            </label>
            <textarea
              value={formState.notes}
              onChange={(e) =>
                setFormState((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
              className="mt-1 w-full border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-500 hover:text-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {saving ? "Saving..." : "Add to trip"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Dashboard;

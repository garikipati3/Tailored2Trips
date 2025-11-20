import { useEffect, useState } from "react";
import fetcher from "../utils/fetcher";
import TopBar from "../components/TopBar";
import toast from "react-hot-toast";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [preferenceOptions, setPreferenceOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [preferencesMode, setPreferencesMode] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch profile
        const profileRes = await fetcher("/api/user/profile", {
          method: "GET",
          credentials: "include",
        });

        if (profileRes.success) {
          setProfile(profileRes.data);
          setFormData({
            fullName: profileRes.data.fullName || "",
            bio: profileRes.data.bio || "",
            profilePhotoUrl: profileRes.data.profilePhotoUrl || "",
            locale: profileRes.data.locale || "en",
            currency: profileRes.data.currency || "USD"
          });
        }

        // Fetch preferences
        const preferencesRes = await fetcher("/api/user/preferences", {
          method: "GET",
          credentials: "include",
        });

        if (preferencesRes.success) {
          setPreferences(preferencesRes.data);
        }

        // Fetch preference options
        const optionsRes = await fetcher("/api/user/preferences/options", {
          method: "GET",
        });

        if (optionsRes.success) {
          setPreferenceOptions(optionsRes.data);
        }

      } catch (err) {
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleProfileUpdate = async () => {
    try {
      const response = await fetcher("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      if (response.success) {
        setProfile(response.data);
        setEditMode(false);
        toast.success("Profile updated successfully!");
      } else {
        toast.error(response.message || "Failed to update profile");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handlePreferencesUpdate = async (updatedPreferences) => {
    try {
      const response = await fetcher("/api/user/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(updatedPreferences),
      });

      if (response.success) {
        setPreferences(response.data);
        setPreferencesMode(false);
        toast.success("Preferences updated successfully!");
      } else {
        toast.error(response.message || "Failed to update preferences");
      }
    } catch (error) {
      toast.error("Failed to update preferences");
    }
  };

  if (loading) {
    return (
      <>
        <TopBar />
        <div className="flex justify-center items-center min-h-[100vh]">
          <p className="text-indigo-500 font-semibold animate-pulse">
            Loading profile...
          </p>
        </div>
      </>
    );
  }

  if (!profile) return null;

  return (
    <>
      <TopBar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
              <button
                onClick={() => setEditMode(!editMode)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {editMode ? "Cancel" : "Edit Profile"}
              </button>
            </div>

            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-gray-300 rounded-full flex items-center justify-center">
                {profile.profilePhotoUrl ? (
                  <img
                    src={profile.profilePhotoUrl}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-gray-600">
                    {profile.fullName?.charAt(0) || profile.username?.charAt(0)}
                  </span>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {profile.fullName}
                </h2>
                <p className="text-gray-600">@{profile.username}</p>
                <p className="text-gray-600">{profile.email}</p>
                {profile.bio && (
                  <p className="text-gray-700 mt-2">{profile.bio}</p>
                )}
              </div>
            </div>

            {editMode && (
              <div className="mt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 h-20"
                    placeholder="Tell us about yourself..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Profile Photo URL
                  </label>
                  <input
                    type="url"
                    value={formData.profilePhotoUrl}
                    onChange={(e) => setFormData({...formData, profilePhotoUrl: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Language
                    </label>
                    <select
                      value={formData.locale}
                      onChange={(e) => setFormData({...formData, locale: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Currency
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({...formData, currency: e.target.value})}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="JPY">JPY</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={handleProfileUpdate}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Travel Preferences */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Travel Preferences</h2>
              <button
                onClick={() => setPreferencesMode(!preferencesMode)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {preferencesMode ? "Cancel" : "Edit Preferences"}
              </button>
            </div>

            {preferences && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Travel Styles</h3>
                  <div className="flex flex-wrap gap-2">
                    {preferences.travelStyles?.map((style, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {style}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {preferences.interests?.map((interest, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>

                {preferences.budgetMin && preferences.budgetMax && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Budget Range</h3>
                    <p className="text-gray-600">
                      ${preferences.budgetMin} - ${preferences.budgetMax}
                    </p>
                  </div>
                )}

                {preferences.homeAirport && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Home Airport</h3>
                    <p className="text-gray-600">{preferences.homeAirport}</p>
                  </div>
                )}
              </div>
            )}

            {preferencesMode && preferenceOptions && (
              <PreferencesEditor
                preferences={preferences}
                options={preferenceOptions}
                onSave={handlePreferencesUpdate}
                onCancel={() => setPreferencesMode(false)}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Preferences Editor Component
function PreferencesEditor({ preferences, options, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    travelStyles: preferences?.travelStyles || [],
    interests: preferences?.interests || [],
    budgetMin: preferences?.budgetMin || "",
    budgetMax: preferences?.budgetMax || "",
    homeAirport: preferences?.homeAirport || "",
    languages: preferences?.languages || ["en"],
    notificationEmail: preferences?.notificationEmail ?? true,
    notificationPush: preferences?.notificationPush ?? true,
    theme: preferences?.theme || "system"
  });

  const toggleArrayItem = (array, item) => {
    return array.includes(item)
      ? array.filter(i => i !== item)
      : [...array, item];
  };

  return (
    <div className="mt-6 space-y-6 border-t pt-6">
      <div>
        <h3 className="font-semibold text-gray-700 mb-3">Travel Styles</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {options.travelStyles.map((style) => (
            <label key={style} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.travelStyles.includes(style)}
                onChange={() => setFormData({
                  ...formData,
                  travelStyles: toggleArrayItem(formData.travelStyles, style)
                })}
                className="rounded"
              />
              <span className="text-sm">{style}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-semibold text-gray-700 mb-3">Interests</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {options.interests.map((interest) => (
            <label key={interest} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.interests.includes(interest)}
                onChange={() => setFormData({
                  ...formData,
                  interests: toggleArrayItem(formData.interests, interest)
                })}
                className="rounded"
              />
              <span className="text-sm">{interest}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Budget Min ($)
          </label>
          <input
            type="number"
            value={formData.budgetMin}
            onChange={(e) => setFormData({...formData, budgetMin: parseInt(e.target.value) || ""})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="1000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Budget Max ($)
          </label>
          <input
            type="number"
            value={formData.budgetMax}
            onChange={(e) => setFormData({...formData, budgetMax: parseInt(e.target.value) || ""})}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
            placeholder="5000"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Home Airport
        </label>
        <input
          type="text"
          value={formData.homeAirport}
          onChange={(e) => setFormData({...formData, homeAirport: e.target.value})}
          className="w-full border border-gray-300 rounded-lg px-3 py-2"
          placeholder="JFK, LAX, etc."
        />
      </div>

      <div>
        <h3 className="font-semibold text-gray-700 mb-3">Notifications</h3>
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.notificationEmail}
              onChange={(e) => setFormData({...formData, notificationEmail: e.target.checked})}
              className="rounded"
            />
            <span className="text-sm">Email notifications</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={formData.notificationPush}
              onChange={(e) => setFormData({...formData, notificationPush: e.target.checked})}
              className="rounded"
            />
            <span className="text-sm">Push notifications</span>
          </label>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={() => onSave(formData)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Save Preferences
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

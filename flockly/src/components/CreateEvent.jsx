import React, { useState } from "react";

const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl border border-gray-300 shadow-xl bg-black text-white ${className}`}>
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={`p-8 ${className}`}>{children}</div>
);

const Button = ({ children, onClick, type = "button", className = "", disabled = false }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 focus:outline-none ${
      disabled ? "opacity-50 cursor-not-allowed" : ""
    } ${className}`}
  >
    {children}
  </button>
);

export default function CreateEvent({ onCancel, onEventCreated }) {
  const [formData, setFormData] = useState({
    eventName: "",
    description: "",
    price: "",
    lastDate: "",
    eventDate: "",
    eventTime: "",
    capacity: "",
    venue: "",
    contact: "",
  });

  const [customFields, setCustomFields] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newField, setNewField] = useState({ name: "", type: "text" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAddCustomField = () => {
    setShowPopup(true);
  };

  const handleCreateCustomField = () => {
    if (newField.name.trim()) {
      setCustomFields([...customFields, newField]);
      setFormData({ ...formData, [newField.name]: "" });
      setNewField({ name: "", type: "text" });
      setShowPopup(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const customFieldsData = {};
      customFields.forEach((field) => {
        customFieldsData[field.name] = formData[field.name];
      });

      const eventData = {
        eventName: formData.eventName,
        description: formData.description,
        price: parseFloat(formData.price),
        lastDate: formData.lastDate,
        eventDate: formData.eventDate,
        eventTime: formData.eventTime,
        capacity: parseInt(formData.capacity),
        venue: formData.venue,
        contact: formData.contact,
        customFields: customFieldsData,
      };

      const response = await fetch("http://localhost:5000/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(eventData),
      });

      const data = await response.json();

      if (data.success) {
        alert("Event Created Successfully!");
        if (onEventCreated) onEventCreated(data.event);
        if (onCancel) onCancel();
      } else {
        alert(`Failed to create event: ${data.message}`);
      }
    } catch (error) {
      console.error("Error creating event:", error);
      alert("Failed to create event. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center py-12 px-4 relative">
      <h1 className="text-4xl font-bold mb-8 tracking-wide">CREATE YOUR EVENT HERE</h1>

      <Card className="w-full max-w-6xl">
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            
            {/* LEFT SECTION (Adjusted Layout — No Image Upload) */}
            <div className="flex flex-col w-full md:w-1/2 gap-6">

              <div>
                <label className="block text-lg font-semibold mb-2">Venue</label>
                <input
                  type="text"
                  name="venue"
                  value={formData.venue}
                  onChange={handleChange}
                  placeholder="Enter event venue"
                  className="w-full p-3 rounded-lg bg-white text-black font-semibold focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-lg font-semibold mb-2">Contact</label>
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="Enter contact info (email or phone)"
                  className="w-full p-3 rounded-lg bg-white text-black font-semibold focus:outline-none"
                  required
                />
              </div>

              <Button
                type="button"
                onClick={handleAddCustomField}
                className="w-full bg-white text-black font-bold hover:bg-gray-200"
              >
                + Add Custom Field
              </Button>

            </div>

            {/* RIGHT SECTION */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 w-full md:w-1/2">
              <div>
                <label className="block text-lg font-semibold mb-2">Event Name</label>
                <input
                  type="text"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleChange}
                  placeholder="Enter event name"
                  className="w-full p-3 rounded-lg bg-white text-black font-semibold focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-lg font-semibold mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Write a short description"
                  className="w-full p-3 rounded-lg bg-white text-black font-semibold focus:outline-none"
                  rows="4"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-lg font-semibold mb-2">Price</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Enter price"
                    className="w-full p-3 rounded-lg bg-white text-black font-semibold focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold mb-2">Event Date</label>
                  <input
                    type="date"
                    name="eventDate"
                    value={formData.eventDate}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-white text-black font-semibold focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold mb-2">Event Time</label>
                  <input
                    type="time"
                    name="eventTime"
                    value={formData.eventTime}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-white text-black font-semibold focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-semibold mb-2">Last Date</label>
                  <input
                    type="date"
                    name="lastDate"
                    value={formData.lastDate}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg bg-white text-black font-semibold focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-lg font-semibold mb-2">Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    placeholder="Max attendees"
                    className="w-full p-3 rounded-lg bg-white text-black font-semibold focus:outline-none"
                    required
                  />
                </div>
              </div>

              {customFields.map((field, index) => (
                <div key={index}>
                  <label className="block text-lg font-semibold mb-2">{field.name}</label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name] || ""}
                    onChange={handleChange}
                    placeholder={`Enter ${field.name}`}
                    className="w-full p-3 rounded-lg bg-white text-black font-semibold focus:outline-none"
                  />
                </div>
              ))}

              <Button
                type="submit"
                disabled={loading}
                className="mt-6 w-full bg-white text-black font-bold hover:bg-gray-200"
              >
                {loading ? "Creating Event..." : "Create Event"}
              </Button>

              <Button
                type="button"
                onClick={() => {
                  if (window.confirm("Are you sure you want to cancel?")) {
                    if (typeof onCancel === "function") onCancel();
                    else window.history.back();
                  }
                }}
                className="mt-4 w-full bg-red-500 text-black font-bold hover:bg-red-600"
              >
                Cancel
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      {showPopup && (
        <div className="absolute inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
          <div className="bg-white text-black rounded-2xl p-6 w-96 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Add Custom Field</h2>

            <label className="block mb-2 font-semibold">Field Name</label>
            <input
              type="text"
              value={newField.name}
              onChange={(e) => setNewField({ ...newField, name: e.target.value })}
              placeholder="Enter field name"
              className="w-full p-2 mb-4 border rounded-lg"
            />

            <label className="block mb-2 font-semibold">Field Type</label>
            <select
              value={newField.type}
              onChange={(e) => setNewField({ ...newField, type: e.target.value })}
              className="w-full p-2 mb-4 border rounded-lg"
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
              <option value="time">Time</option>
              <option value="email">Email</option>
            </select>

            <div className="flex justify-between">
              <Button onClick={handleCreateCustomField} className="bg-black text-white hover:bg-gray-800">
                Add
              </Button>

              <Button
                onClick={() => setShowPopup(false)}
                className="bg-red-500 text-black hover:bg-red-600"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

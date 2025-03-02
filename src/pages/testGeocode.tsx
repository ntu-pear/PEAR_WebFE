import { fetchAddress, GeocodeBase } from "@/api/geocode";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";

const TestGeocode: React.FC = () => {
  const [postalCode, setPostalCode] = useState("");
  const [address, setAddress] = useState("");
  const [unitNumber, setUnitNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isValidPostalCode = (code: string) => {
    const postalCodeRegex = /^\d{6}$/; // Regex for 6-digit numeric postal code
    return postalCodeRegex.test(code);
  };

  const handleRetrieve = async () => {
    if (!postalCode) {
      setError("Postal Code is required.");
      return;
    }

    if (!isValidPostalCode(postalCode)) {
      setError("Postal Code must be a 6-digit number.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const fetchedAddress: GeocodeBase = await fetchAddress(
        Number(postalCode),
        encodeURIComponent(unitNumber)
      );
      setAddress(fetchedAddress.fullAddress);
    } catch (error: any) {
      console.error("Error retrieving the address.:", error);

      if (error?.status === 404) {
        console.log("Address not found for the provided postal code.");
        setError("Address not found for the provided postal code.");
      } else {
        console.log("An unexpected error occurred:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setPostalCode("");
    setAddress("");
    setUnitNumber("");
    setError("");
  };

  return (
    <div className="flex min-h-screen w-full flex-col max-w-[1400px] container mx-auto px-4">
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <h3 className="font-medium mb-2 text-3xl">Test Geocode</h3>
        <div className="col-span-2">
          <div className="p-4 rounded-lg border">
            <h3 className="font-medium mb-2">New Address</h3>
            <div className="grid grid-cols-8 gap-x-4 sm:gap-y-4 mb-2">
              <div className="space-y-2 col-span-2">
                <label className="block text-sm font-medium">
                  Postal Code <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={postalCode}
                  className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                  onChange={(e) => setPostalCode(e.target.value || "")}
                  required
                />
              </div>
              <div className="space-y-2 col-span-3">
                <label className="col-span-3 block text-sm font-medium">
                  Unit Number
                </label>
                <input
                  type="text"
                  value={unitNumber}
                  className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                  onChange={(e) => setUnitNumber(e.target.value || "")}
                />
              </div>
              <div className="space-y-2 col-span-4 sm:col-span-3">
                <Button
                  type="button"
                  className="mt-7 col-span-2 mr-2"
                  onClick={() => handleRetrieve()}
                >
                  {loading ? "Retrieving..." : "Retrieve"}
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="mt-7 col-span-1"
                  onClick={() => handleClear()}
                >
                  Clear
                </Button>
              </div>
            </div>
            {error && <div className="text-red-600 mb-2">{error}</div>}
            <div className="col-span-2">
              <label className="block text-sm font-medium">
                Address <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={address}
                className="mt-1 block w-full p-2 border rounded-md text-gray-900"
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestGeocode;

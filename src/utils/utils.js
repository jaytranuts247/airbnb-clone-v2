import moment from "moment";

export const DOTOGGLE = false;
export const FORCETRUE = true;

export const PROXY_URL = "https://cors-anywhere.herokuapp.com/";
export const TARGET_URL =
	"https://maps.googleapis.com/maps/api/place/autocomplete/json?&key=KEY";
export const URL = PROXY_URL + TARGET_URL;

export const validateTypes = {
	OK: "OK",
	NO_GUEST: "NO_GUEST",
	START_DATE: "START_DATE",
	END_DATE: "END_DATE",
	LOCATION: "LOCATION",
};

export const demoLocationSearchResults = [
	{
		id: 1,
		name: "Las Vegas",
		state: "Nevada",
		stateSymbol: "NV",
		city: "Las Vegas",
	},
	{
		id: 2,
		name: "Las Vegas Strip",
		state: "Nevada",
		stateSymbol: "NV",
		city: "Las Vegas",
	},
	{
		id: 3,
		name: "North Las Vegas",
		state: "Nevada",
		stateSymbol: "NV",
		city: "Las Vegas",
	},
];

export const dateDisplay = (date) => moment(date).format("MMMM DD");

export const guestDisplay = (adultsCount, childrenCount, infantsCount) => {
	if (adultsCount + childrenCount + infantsCount === 0) {
		return "Add Guests";
	}
	return `${adultsCount + childrenCount} ${
		adultsCount + childrenCount <= 1 ? "guest" : "guests"
	} ${infantsCount !== 0 ? ", " + infantsCount : ""} ${
		infantsCount !== 0 ? (infantsCount <= 1 ? "infant" : "infants") : ""
	}`;
};

export const validateBookingInfo = (bookingInfo) => {
	if (bookingInfo.selectedLocation === null) return validateTypes.LOCATION;
	if (bookingInfo.startDate === null) return validateTypes.START_DATE;
	if (bookingInfo.endDate === null) return validateTypes.END_DATE;

	if (
		bookingInfo.adultsNum + bookingInfo.childrenNum + bookingInfo.infantsNum ===
		0
	)
		return validateTypes.NO_GUEST;
	return validateTypes.OK;
};

export const dateDisplaySearch = (guestNumber) => {
	return guestNumber === 0
		? "Add Guests"
		: guestNumber + (guestNumber <= 1 ? "guest" : "guests");
};

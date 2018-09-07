export declare namespace MapQuestDirections {
	export interface Ul {
		lng: number;
		lat: number;
	}

	export interface Lr {
		lng: number;
		lat: number;
	}

	export interface BoundingBox {
		ul: Ul;
		lr: Lr;
	}

	export interface LatLng {
		lng: number;
		lat: number;
	}

	export interface DisplayLatLng {
		lng: number;
		lat: number;
	}

	export interface Location {
		latLng: LatLng;
		adminArea4: string;
		adminArea5Type: string;
		adminArea4Type: string;
		adminArea5: string;
		street: string;
		adminArea1: string;
		adminArea3: string;
		type: string;
		displayLatLng: DisplayLatLng;
		linkId: number;
		postalCode: string;
		sideOfStreet: string;
		dragPoint: boolean;
		adminArea1Type: string;
		geocodeQuality: string;
		geocodeQualityCode: string;
		adminArea3Type: string;
	}

	export interface Sign {
		text?: string;
		extraText?: string;
		direction?: number;
		type?: number;
		url?: string;
	}

	export interface StartPoint {
		lng: number;
		lat: number;
	}

	export interface Maneuver {
		signs?: Sign[];
		index?: number;
		maneuverNotes?: any[];
		direction?: number;
		narrative?: string;
		iconUrl?: string;
		distance?: number;
		time?: number;
		linkIds?: any[];
		streets?: string[];
		attributes?: number;
		transportMode?: string;
		formattedTime?: string;
		directionName?: string;
		mapUrl?: string;
		startPoint?: StartPoint;
		turnType?: number;
	}

	export interface Leg {
		hasTollRoad?: boolean;
		index?: number;
		roadGradeStrategy?: any[][];
		hasHighway?: boolean;
		hasUnpaved?: boolean;
		distance?: number;
		time?: number;
		origIndex?: number;
		hasSeasonalClosure?: boolean;
		origNarrative?: string;
		hasCountryCross?: boolean;
		formattedTime?: string;
		destNarrative?: string;
		destIndex?: number;
		maneuvers?: Maneuver[];
		hasFerry?: boolean;
	}

	export interface RouteError {
		message: string;
		errorCode: number;
	}

	export interface Options {
		mustAvoidLinkIds?: any[];
		drivingStyle?: number;
		countryBoundaryDisplay?: boolean;
		generalize?: number;
		narrativeType?: string;
		locale?: string;
		avoidTimedConditions?: boolean;
		destinationManeuverDisplay?: boolean;
		enhancedNarrative?: boolean;
		filterZoneFactor?: number;
		timeType?: number;
		maxWalkingDistance?: number;
		routeType?: string;
		transferPenalty?: number;
		stateBoundaryDisplay?: boolean;
		walkingSpeed?: number;
		maxLinkId?: number;
		arteryWeights?: any[];
		tryAvoidLinkIds?: any[];
		unit?: string;
		routeNumber?: number;
		shapeFormat?: string;
		maneuverPenalty?: number;
		useTraffic?: boolean;
		returnLinkDirections?: boolean;
		avoidTripIds?: any[];
		manmaps?: string;
		highwayEfficiency?: number;
		sideOfStreetDisplay?: boolean;
		cyclingRoadFactor?: number;
		urbanAvoidFactor?: number;
	}

	export interface Route {
		hasTollRoad?: boolean;
		computedWaypoints?: any[];
		fuelUsed?: number;
		hasUnpaved?: boolean;
		hasHighway?: boolean;
		realTime?: number;
		boundingBox?: BoundingBox;
		distance?: number;
		time?: number;
		locationSequence?: number[];
		hasSeasonalClosure?: boolean;
		sessionId?: string;
		locations?: Location[];
		hasCountryCross?: boolean;
		legs?: Leg[];
		formattedTime?: string;
		routeError?: RouteError;
		options?: Options;
		hasFerry?: boolean;
		shape?: {
			legIndexes: number[];
			maneuverIndexes: number[];
			shapePoints: number[];
		};
	}

	export interface Copyright {
		text: string;
		imageUrl: string;
		imageAltText: string;
	}

	export interface Info {
		copyright: Copyright;
		statuscode: number;
		messages: any[];
	}

	export interface Response {
		route: Route;
		info: Info;
	}
}

export declare namespace MapQuestRoute {
	interface Response extends MapQuestDirections.Response {}
}

interface Ilocation {
	locatie: string,
	naam: string,
	beschrijving: string,
	startdatum: string,
	einddatum: string,
	fotos?: string[],
};

interface Iholiday {
	naam: string,
	deelnemers: string,
	locatie: string,
	startdatum: string,
	einddatum: string,
	locaties: Ilocation[],
};

function Holiday(holidayData){

};

export { Holiday }
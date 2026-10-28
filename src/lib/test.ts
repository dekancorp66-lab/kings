import { parseCaption } from "./parse-caption";
const samples = [
`*Subaru Forester 2016* | Price: 28,500,000 TZS | Mileage: 85,000 km | Engine 2000cc | Petrol | Auto | 4WD | Silver || Sunroof || Leather seats || Reverse camera || Push start`,
`TOYOTA HARRIER 2015
Price: 42,000,000/=
Mileage: 62k km
2.0L Petrol CVT AWD Pearl White
|| Power seats || Alloy wheels`,
`Toyota Hilux 2018 diesel manual 4x4 white 1,000,000 km price tzs 65,000,000`,
`Mercedes Benz C200 2014 black 3,500,000`,
];
for (const s of samples) { const r = parseCaption(s); console.log(JSON.stringify({...r, description: undefined}, null, 0)); }

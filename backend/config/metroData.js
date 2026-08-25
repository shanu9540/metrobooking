// Anchor Stations with exact Coordinates (Longitude, Latitude)
const ANCHORS = {
  // Yellow Line
  'samaypur_badli': [77.1520, 28.7450],
  'azadpur': [77.1780, 28.6970],
  'kashmere_gate': [77.2284, 28.6675],
  'new_delhi': [77.2223, 28.6431],
  'rajiv_chowk': [77.2197, 28.6328],
  'central_secretariat': [77.2114, 28.6148],
  'dilli_haat___ina': [77.2090, 28.5750],
  'aiims': [77.2072, 28.5686],
  'hauz_khas': [77.2060, 28.5430],
  'sikanderpur': [77.0910, 28.4795],
  'millennium_city_centre_gurugram': [77.0725, 28.4593],

  // Blue Line
  'dwarka_sector_21': [77.0583, 28.5523],
  'janakpuri_west': [77.0790, 28.6290],
  'rajouri_garden': [77.1215, 28.6489],
  'kirti_nagar': [77.1620, 28.6550],
  'mandi_house': [77.2339, 28.6256],
  'yamuna_bank': [77.2625, 28.6212],
  'mayur_vihar_phase_1': [77.2890, 28.6040],
  'noida_sector_18': [77.3259, 28.5708],
  'botanical_garden': [77.3340, 28.5640],
  'noida_city_centre': [77.3409, 28.5747],
  'noida_sector_52': [77.3621, 28.5831],
  'noida_electronic_city': [77.3730, 28.6288],

  // Blue Line Branch
  'karkarduma': [77.3050, 28.6480],
  'anand_vihar': [77.3150, 28.6470],
  'vaishali': [77.3390, 28.6495],

  // Red Line
  'rithala': [77.1065, 28.7205],
  'netaji_subhash_place': [77.1520, 28.6955],
  'inderlok': [77.1560, 28.6730],
  'welcome': [77.2775, 28.6710],
  'dilshad_garden': [77.3218, 28.6758],
  'shaheed_sthal__new_bus_adda_': [77.4045, 28.6795],

  // Violet Line
  'raja_nahar_singh': [77.3245, 28.3410],
  'kalkaji_mandir': [77.2590, 28.5480],
  'lajpat_nagar': [77.2440, 28.5700],

  // Airport Line
  'yashobhoomi_dwarka_sector_25': [77.0420, 28.5490],

  // Aqua Line
  'noida_sector_51': [77.3640, 28.5835],
  'depot': [77.5190, 28.4900],

  // Green Line
  'ashok_park_main': [77.1565, 28.6650],
  'brigadier_hoshiar_singh': [76.8725, 28.6930],

  // Grey Line
  'dwarka': [77.1215, 28.5922],
  'dhansa_bus_stand': [76.9850, 28.6130],

  // Rapid Metro
  'sector_55_56': [77.1050, 28.4410],

  // Pink Line
  'majlis_park': [77.1650, 28.7290],
  'welcome': [77.2775, 28.6710],
  'shiv_vihar': [77.3520, 28.7120]
};

const LINES_STATIONS = {
  'Blue Line': [
    'Dwarka Sector 21', 'Dwarka Sector 8', 'Dwarka Sector 9', 'Dwarka Sector 10', 'Dwarka Sector 11',
    'Dwarka Sector 12', 'Dwarka Sector 13', 'Dwarka Sector 14', 'Dwarka', 'Dwarka Mor', 'Nawada',
    'Uttam Nagar West', 'Uttam Nagar East', 'Janakpuri West', 'Janakpuri East', 'Tilak Nagar',
    'Subhash Nagar', 'Tagore Garden', 'Rajouri Garden', 'Ramesh Nagar', 'Moti Nagar', 'Kirti Nagar',
    'Shadipur', 'Patel Nagar', 'Rajendra Place', 'Karol Bagh', 'Jhandewalan', 'R K Ashram Marg',
    'Rajiv Chowk', 'Barakhamba Road', 'Mandi House', 'Supreme Court', 'Indraprastha', 'Yamuna Bank',
    'Akshardham', 'Mayur Vihar Phase-1', 'Mayur Vihar Extension', 'New Ashok Nagar', 'Noida Sector 15',
    'Noida Sector 16', 'Noida Sector 18', 'Botanical Garden', 'Golf Course', 'Noida City Centre',
    'Noida Sector 34', 'Noida Sector 52', 'Noida Sector 61', 'Noida Sector 59', 'Noida Sector 62',
    'Noida Electronic City'
  ],
  'Blue Line Branch': [
    'Yamuna Bank', 'Laxmi Nagar', 'Nirman Vihar', 'Preet Vihar', 'Karkarduma', 'Anand Vihar',
    'Kaushambi', 'Vaishali'
  ],
  'Yellow Line': [
    'Samaypur Badli', 'Rohini Sector 18, 19', 'Haiderpur Badli Mor', 'Jahangirpuri', 'Adarsh Nagar',
    'Azadpur', 'Model Town', 'G.T.B. Nagar', 'Vishwavidyalaya', 'Vidhan Sabha', 'Civil Lines',
    'Kashmere Gate', 'Chandni Chowk', 'Chawri Bazar', 'New Delhi', 'Rajiv Chowk', 'Patel Chowk',
    'Central Secretariat', 'Udyog Bhawan', 'Lok Kalyan Marg', 'Jor Bagh', 'Dilli Haat - INA',
    'AIIMS', 'Green Park', 'Hauz Khas', 'Malviya Nagar', 'Saket', 'Qutab Minar', 'Chhatarpur',
    'Sultanpur', 'Ghitorni', 'Arjan Garh', 'Guru Dronacharya', 'Sikanderpur', 'MG Road', 'IFFCO Chowk',
    'Millennium City Centre Gurugram'
  ],
  'Red Line': [
    'Rithala', 'Rohini West', 'Rohini East', 'Pitampura', 'Kohat Enclave', 'Netaji Subhash Place',
    'Keshav Puram', 'Kanhaiya Nagar', 'Inderlok', 'Shastri Nagar', 'Pratap Nagar', 'Pul Bangash',
    'Tis Hazari', 'Kashmere Gate', 'Shastri Park', 'Seelampur', 'Welcome', 'Shahdara', 'Mansarovar Park',
    'Jhilmil', 'Dilshad Garden', 'Shahid Nagar', 'Raj Bagh', 'Major Mohit Sharma Rajendra Nagar',
    'Shyam Park', 'Mohan Nagar', 'Arthala', 'River Side', 'Shaheed Sthal (New Bus Adda)'
  ],
  'Violet Line': [
    'Kashmere Gate', 'Lal Quila', 'Jama Masjid', 'Delhi Gate', 'ITO', 'Mandi House', 'Janpath',
    'Central Secretariat', 'Khan Market', 'Jawaharlal Nehru Stadium', 'Jangpura', 'Lajpat Nagar',
    'Moolchand', 'Kailash Colony', 'Nehru Place', 'Kalkaji Mandir', 'Govind Puri', 'Harkesh Nagar Okhla',
    'Jasola Apollo', 'Sarita Vihar', 'Mohan Estate', 'Tughlakabad Station', 'Badarpur Border', 'Sarai',
    'NHPC Chowk', 'Mewala Maharajpur', 'Sector 28', 'Badkal Mor', 'Old Faridabad', 'Neelam Chowk Ajronda',
    'Bata Chowk', 'Escorts Mujesar', 'Sant Surdas (Sihi)', 'Raja Nahar Singh'
  ],
  'Magenta Line': [
    'Janakpuri West', 'Dabri Mor - Janakpuri South', 'Dashrathpuri', 'Palam', 'Sadar Bazar Cantonment',
    'Terminal 1-IGI Airport', 'Shankar Vihar', 'Vasant Vihar', 'Munirka', 'R.K. Puram', 'IIT',
    'Hauz Khas', 'Panchsheel Park', 'Chirag Delhi', 'Greater Kailash', 'Nehru Enclave', 'Kalkaji Mandir',
    'Okhla NSIC', 'Sukhdev Vihar', 'Jamia Millia Islamia', 'Okhla Vihar', 'Jasola Vihar Shaheen Bagh',
    'Kalindi Kunj', 'Okhla Bird Sanctuary', 'Botanical Garden'
  ],
  'Airport Express': [
    'New Delhi', 'Shivaji Stadium', 'Dhaula Kuan', 'Delhi Aerocity', 'IGI Airport', 'Dwarka Sector 21',
    'Yashobhoomi Dwarka Sector 25'
  ],
  'Aqua Line': [
    'Noida Sector 51', 'Noida Sector 50', 'Noida Sector 76', 'Noida Sector 101', 'Noida Sector 81',
    'NSEZ', 'Noida Sector 83', 'Noida Sector 137', 'Noida Sector 142', 'Noida Sector 143', 'Noida Sector 144',
    'Noida Sector 145', 'Noida Sector 146', 'Noida Sector 147', 'Noida Sector 148', 'Knowledge Park II',
    'Pari Chowk', 'Alpha 1', 'Delta 1', 'GNIDA Office', 'Depot'
  ],
  'Green Line': [
    'Inderlok', 'Ashok Park Main', 'Punjabi Bagh', 'Shivaji Park', 'Madipur', 'Paschim Vihar East',
    'Paschim Vihar West', 'Peeragarhi', 'Udyog Nagar', 'Surajmal Stadium', 'Nangloi', 'Nangloi Railway Station',
    'Rajdhani Park', 'Mundka', 'Mundka Industrial Area', 'Ghevra Metro Station', 'Tikri Kalan', 'Tikri Border',
    'Pandit Shree Ram Sharma', 'Bahadurgarh City', 'Brigadier Hoshiar Singh'
  ],
  'Grey Line': [
    'Dwarka', 'Nangli', 'Najafgarh', 'Dhansa Bus Stand'
  ],
  'Rapid Metro': [
    'Sikanderpur', 'Phase 2', 'Belvedere Towers', 'Cyber City', 'Phase 3', 'Phase 1', 'Sector 42-43',
    'Sector 53-54', 'Sector 54 Forest Chawk', 'Sector 55-56'
  ],
  'Pink Line': [
    'Majlis Park', 'Azadpur', 'Shalimar Bagh', 'Netaji Subhash Place', 'Shakurpur', 'Punjabi Bagh West',
    'ESI-Basai Darapur', 'Rajouri Garden', 'Mayapuri', 'Naraina Vihar', 'Delhi Cantt', 'Durgabai Deshmukh South Campus',
    'Sir M. Vishweshwaraiah Moti Bagh', 'Bhikaji Cama Place', 'Sarojini Nagar', 'Dilli Haat - INA',
    'South Extension', 'Lajpat Nagar', 'Vinobapuri', 'Ashram', 'Sarai Kale Khan - Hazrat Nizamuddin',
    'Mayur Vihar Phase-1', 'Mayur Vihar Pocket-1', 'Trilokpuri', 'East Azad Nagar', 'Krishna Nagar',
    'Karkarduma', 'Anand Vihar', 'Welcome', 'Shiv Vihar'
  ]
};

const stationsMap = {};

function getCoordsForStation(name, lineName, index) {
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  if (ANCHORS[slug]) {
    return ANCHORS[slug];
  }

  const stationsList = LINES_STATIONS[lineName];
  
  // Find preceding anchor
  let idxA = index;
  while (idxA >= 0) {
    const sName = stationsList[idxA];
    const sSlug = sName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (ANCHORS[sSlug]) break;
    idxA--;
  }
  
  // Find succeeding anchor
  let idxB = index;
  while (idxB < stationsList.length) {
    const sName = stationsList[idxB];
    const sSlug = sName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (ANCHORS[sSlug]) break;
    idxB++;
  }
  
  if (idxA >= 0 && idxB < stationsList.length) {
    const slugA = stationsList[idxA].toLowerCase().replace(/[^a-z0-9]/g, '_');
    const slugB = stationsList[idxB].toLowerCase().replace(/[^a-z0-9]/g, '_');
    const coordA = ANCHORS[slugA];
    const coordB = ANCHORS[slugB];
    
    const ratio = (index - idxA) / (idxB - idxA);
    const lon = coordA[0] + ratio * (coordB[0] - coordA[0]);
    const lat = coordA[1] + ratio * (coordB[1] - coordA[1]);
    return [Math.round(lon * 10000) / 10000, Math.round(lat * 10000) / 10000];
  }
  
  return [77.2197, 28.6328];
}

// Populate stations map
Object.keys(LINES_STATIONS).forEach(lineName => {
  const stationsList = LINES_STATIONS[lineName];
  stationsList.forEach((name, index) => {
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (!stationsMap[id]) {
      stationsMap[id] = {
        _id: id,
        stationId: id,
        stationName: name,
        lineName: [lineName],
        location: {
          type: 'Point',
          coordinates: getCoordsForStation(name, lineName, index)
        },
        address: `${name} Metro Station, Delhi/NCR`
      };
    } else {
      if (!stationsMap[id].lineName.includes(lineName)) {
        stationsMap[id].lineName.push(lineName);
      }
    }
  });
});

const STATIC_STATIONS = Object.values(stationsMap);

const connectionsList = [];

function getDistance(c1, c2) {
  const lon1 = c1[0];
  const lat1 = c1[1];
  const lon2 = c2[0];
  const lat2 = c2[1];
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c;
  return Math.round(d * 100) / 100;
}

// Generate sequential connections along each line
Object.keys(LINES_STATIONS).forEach(lineName => {
  const stationsList = LINES_STATIONS[lineName];
  for (let i = 0; i < stationsList.length - 1; i++) {
    const s1 = stationsList[i];
    const s2 = stationsList[i + 1];
    
    const id1 = s1.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const id2 = s2.toLowerCase().replace(/[^a-z0-9]/g, '_');
    
    const c1 = stationsMap[id1].location.coordinates;
    const c2 = stationsMap[id2].location.coordinates;
    
    const dist = getDistance(c1, c2);
    const dur = Math.round(dist * 1.33 + 1);
    
    connectionsList.push({
      from: id1,
      to: id2,
      line: lineName,
      dist: dist > 0 ? dist : 1.2,
      dur: dur > 0 ? dur : 2
    });
  }
});

// Add manual green line branch and walkway links
connectionsList.push({
  from: 'kirti_nagar',
  to: 'ashok_park_main',
  line: 'Green Line',
  dist: 1.2,
  dur: 2
});

connectionsList.push({
  from: 'noida_sector_52',
  to: 'noida_sector_51',
  line: 'Walkway',
  dist: 0.4,
  dur: 5
});

connectionsList.push({
  from: 'dhaula_kuan',
  to: 'durgabai_deshmukh_south_campus',
  line: 'Walkway',
  dist: 1.0,
  dur: 10
});

module.exports = {
  STATIC_STATIONS,
  connections: connectionsList,
  LINES_STATIONS
};

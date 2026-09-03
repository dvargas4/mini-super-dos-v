/*
  ARCHIVO DE ADMINISTRACIÓN DEL CATÁLOGO

  1. Cambia el número de WhatsApp en STORE_CONFIG.
  2. Pega una sola vez el enlace CSV público de Google Sheets.
  3. Después administra nombres, precios, fotos y visibilidad desde la hoja.
*/

window.STORE_CONFIG = {
  name: "Mini Súper Dos V",
  whatsapp: "522206477892",
  googleSheetCsvUrl: "https://docs.google.com/spreadsheets/d/19sAp7dciL0yMlcuHA-qtr7eaRtWqaCwJUIf0QRU01GQ/edit?usp=sharing",
  sheetRefreshMinutes: 5,
  freeDeliveryKg: 5,
  deliveryDay: "sábado",
  deliveryLimit: "01:00 a. m.",
  orderCutoff: "viernes",
  deliveryZone: "Alrededores de Calzada México-Xochimilco 62, San Lorenzo Huipulco, Tlalpan, Ciudad de México.",
  paymentOptions: ["Transferencia", "Tarjeta", "Efectivo"],
};

const CATALOG = {
  "Frutas": [
    "Plátano", "Papaya", "Aguacate", "Mango", "Uva", "Manzana verde", "Limón", "Domo de Fresas", "Kiwi",
    "Manzana amarilla", "Guayaba", "Manzana roja", "Zarzamora", "Dátil", "Pera Red Anjou", "Tuna",
    "Melón", "Melón grande", "Naranja", "Arándano", "Pera mantequilla", "Sandía", "Plátano macho",
    "Toronja", "Mamey", "Durazno", "Manzana Gala", "Xoconostle", "Plátano dominico", "Frambuesa",
    "Ciruela moscatel", "Piña", "Mora azul", "Lychee", "Limón sin semilla", "Mango niño", "Higo",
    "Mandarina", "Mango petacón", "Aguacate criollo", "Durazno nectarina", "Sandía baby", "Lima",
    "Durazno chabacano", "Uva Cotton Candy", "Chicozapote", "Naranja Valencia", "Naranja sin semilla",
    "Tejocote", "Zapote negro", "Limón Eureka", "Pitahaya", "Fresa de granel", "Fruta mixta",
    "Tamarindo", "Cereza", "Granada"
  ],
  "Verduras y hierbas": [
    "Jitomate", "Lechuga romana", "Jengibre", "Papa blanca", "Setas", "Pepinillos", "Poro", "Calabaza",
    "Tomate", "Chayote", "Espinaca", "Coliflor", "Chícharos", "Nopales", "Apio", "Cilantro",
    "Flor de calabaza", "Champiñones", "Zanahoria", "Cebolla", "Elotes", "Jícama", "Col",
    "Plato de verduras", "Ejotes", "Camote", "Lechuga orejona", "Jitomate cherry", "Hierbabuena",
    "Epazote", "Cebollín", "Betabel", "Cebolla morada", "Lechuga italiana", "Germen de soya", "Perejil",
    "Huauzontle", "Acelga", "Brócoli", "Espárragos", "Ajo", "Pepino", "Huitlacoche", "Cebolla cambray",
    "Berenjena", "Nopal cambray", "Alfalfa", "Jitomate bola", "Arúgula", "Menta", "Bolsa de espinaca",
    "Bolsa de apio", "Bolsa de lechuga", "Alcachofa", "Bolsa de lechuga orejona", "Nabo", "Hinojo",
    "Papa cambray"
  ],
  "Chiles y pimientos": [
    "Chile serrano", "Pimiento", "Chile poblano", "Chile pasilla", "Chile de árbol verde",
    "Chile de árbol seco", "Chile guajillo", "Chile ancho", "Jalapeño", "Paprika", "Chile habanero"
  ],
  "Quesos y refrigerados": [
    "Queso parmesano", "Queso crema", "Queso Philadelphia", "Queso manchego", "Jamón de pierna",
    "Queso Cotija", "Queso Oaxaca", "Huevo", "Tocino", "Queso panela", "Queso canasto",
    "Queso menonita", "Queso Gouda", "Jamón de pavo", "Salchicha", "Caja de huevo", "Queso mozzarella"
  ],
  "Semillas, granos y secos": [
    "Nuez de la India", "Nuez", "Almendra", "Lenteja", "Arándano con chocolate", "Avena", "Chía",
    "Maíz palomero", "Garbanzo", "Pepita verde sin aceite", "Ciruela pasa sin hueso", "Frijol",
    "Almendra con chocolate", "Haba", "Quinoa", "Arándano con Tajín", "Cacahuate tostado",
    "Japonés enchilado", "Nuez de Brasil", "Pistache", "Durazno chabacano deshidratado", "Linaza",
    "Cacahuate salado", "Pasas", "Amaranto", "Cacahuate enchilado", "Ajonjolí", "Ajonjolí GARP",
    "Alegrías", "Maíz pozolero", "Cacahuate español", "Alpiste", "Arroz integral", "Coco rallado",
    "Cacahuate japonés"
  ],
  "Abarrotes y condimentos": [
    "Cúrcuma en polvo", "Canela importada", "Jamaica seca", "Cereza en frasco", "Piloncillo",
    "Bicarbonato de sodio", "Azúcar glass", "Chispas de chocolate", "Panko", "Jengibre molido en polvo",
    "Pimienta blanca molida", "Maizena", "Cocoa", "Chocolate en polvo", "Pulpa de camarón en polvo",
    "Pan molido", "Consomé de pollo", "Canela natural en polvo", "Consomé de res", "Grenetina",
    "Canela sintética en polvo", "Cebolla en polvo con sal", "Ajo en polvo con sal",
    "Cebolla en polvo sin sal", "Ajo en polvo sin sal", "Camarón seco", "Polvo de camarón",
    "Aceite de aguacate", "Churros", "Azúcar blanca", "Aceite de coco", "Papas botana", "Aderezo César"
  ]
};

/*
  Respaldo local mientras Google Sheets carga o si no hay conexión.
  Los precios conservan exactamente la presentación capturada por la tienda.
*/
const WEEKLY_PRICES = {
  "Jitomate": { price: "$12.50", priceUnit: "½ kg" },
  "Cebolla": { price: "$32.00", priceUnit: "½ kg" }
};

function slugify(value) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

window.PRODUCTS = Object.entries(CATALOG)
  .flatMap(([category, names]) => names.map((name) => ({
    id: slugify(name),
    name,
    category,
    defaultUnit: ["Sandía", "Sandía baby"].includes(name) ? "PZ" : "KG",
    allowedUnits: ["Sandía", "Sandía baby"].includes(name) ? ["PZ"] : ["PZ", "G", "KG"],
    price: WEEKLY_PRICES[name]?.price ?? "",
    priceUnit: WEEKLY_PRICES[name]?.priceUnit ?? "",
    photoUrl: "",
    photoCredit: "",
    photoSource: "",
    active: true,
  })))
  .sort((a, b) => a.name.localeCompare(b.name, "es"));

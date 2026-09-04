const store = window.STORE_CONFIG;
const defaultPhotos = window.DEFAULT_PRODUCT_PHOTOS || {};
const defaultPhotoByName = new Map(Object.entries(defaultPhotos).map(([name, photo]) => [normalize(name), photo]));
let products = window.PRODUCTS.map(withDefaultPhoto);

const categoryOrder = [
  "Frutas",
  "Verduras y hierbas",
  "Chiles y pimientos",
  "Quesos y refrigerados",
  "Semillas, granos y secos",
  "Abarrotes y condimentos",
  "Otros",
];
products.sort((a, b) => {
  const aIndex = categoryOrder.indexOf(a.category);
  const bIndex = categoryOrder.indexOf(b.category);
  const categoryDifference = (aIndex < 0 ? categoryOrder.length : aIndex) - (bIndex < 0 ? categoryOrder.length : bIndex);
  return categoryDifference || a.name.localeCompare(b.name, "es");
});

const sheetNameAliases = {
  "cereza frasco": "cereza en frasco",
  "arandano c choc": "arandano con chocolate",
  "plato verduras": "plato de verduras",
  "almendra c choc": "almendra con chocolate",
  "chile arbol seco": "chile de arbol seco",
  "pimienta blanca molido": "pimienta blanca molida",
  "pulpa de camaron polvo": "pulpa de camaron en polvo",
  "canela natural polvo": "canela natural en polvo",
  "canela sintetica polvo": "canela sintetica en polvo",
  "cotton candy uva": "uva cotton candy",
  "caja huevo": "caja de huevo",
  "bolsa espinaca": "bolsa de espinaca",
  "bolsa apio": "bolsa de apio",
  "bolsa lechuga": "bolsa de lechuga",
  "bolsa lechuga orejona": "bolsa de lechuga orejona",
  "queso mozarella": "queso mozzarella",
};

const state = {
  category: "Todo",
  query: "",
  cart: loadCart(),
  catalogProductId: "",
  reopenAfterCustom: "",
  lastSheetSync: 0,
};

const elements = Object.fromEntries([
  "categories", "productGrid", "emptyState", "searchInput", "cartCount", "cartDialog", "openCart", "closeCart",
  "cartEmpty", "cartContent", "cartItems", "cartProductCount", "cartEstimatedTotal", "cartPriceLabel", "cartPriceNote",
  "sendOrder", "mobileSummary", "mobileCount", "catalogStatus",
  "deliveryZone", "paymentMethod", "customerForm", "customerName", "streetAddress", "neighborhood", "postalCode",
  "productDialog", "productForm", "productDialogEyebrow", "productDialogName", "productQuantity", "productUnit",
  "productDialogHelp", "productNote", "closeProduct", "cancelProduct", "saveProduct",
  "municipality", "addressReference", "customDialog", "customForm", "customName", "customQuantity", "customUnit",
  "customNote", "openCustom", "emptyCustom", "cartCustom", "closeCustom", "cancelCustom", "confirmationDialog",
  "cancelConfirmation", "openWhatsApp", "finalOrderItems", "finalOrderCount", "finalAddProduct", "finalAddCustom",
  "detailsDialog", "closeDetails", "backToCart",
].map((id) => [id, document.querySelector(`#${id}`)]));

function normalize(value) {
  return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

function slugify(value) {
  return normalize(value).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function validHttpsUrl(value) {
  try {
    const url = new URL(String(value || "").trim());
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

function withDefaultPhoto(product) {
  const photo = defaultPhotoByName.get(normalize(product.name)) || {};
  return {
    ...product,
    photoUrl: validHttpsUrl(product.photoUrl) || validHttpsUrl(photo.url),
    photoCredit: product.photoCredit || photo.credit || "",
    photoSource: validHttpsUrl(product.photoSource) || validHttpsUrl(photo.source),
  };
}

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("dos-v-cart") || "{}");
    return saved && typeof saved === "object" ? saved : {};
  } catch {
    return {};
  }
}

function saveCart() {
  localStorage.setItem("dos-v-cart", JSON.stringify(state.cart));
}

function createNode(tag, className, content) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (content !== undefined) node.textContent = content;
  return node;
}

function iconFor(product) {
  const name = normalize(product.name);
  const icons = [
    [["platano"], "🍌"], [["aguacate"], "🥑"], [["mango"], "🥭"], [["uva"], "🍇"],
    [["manzana"], "🍎"], [["limon", "lima"], "🍋"], [["naranja", "mandarina", "toronja"], "🍊"],
    [["fresa", "frambuesa", "zarzamora", "mora azul", "arandano"], "🍓"], [["kiwi"], "🥝"],
    [["pera"], "🍐"], [["sandia", "melon"], "🍉"], [["cereza"], "🍒"], [["pina"], "🍍"],
    [["coco"], "🥥"], [["durazno", "chabacano", "nectarina"], "🍑"], [["jitomate", "tomate"], "🍅"],
    [["chile", "jalapeno", "pimiento", "paprika"], "🌶️"], [["papa", "camote"], "🥔"],
    [["zanahoria"], "🥕"], [["cebolla", "ajo"], "🧅"], [["pepino", "pepinillo"], "🥒"],
    [["elote", "maiz"], "🌽"], [["berenjena"], "🍆"], [["brocoli"], "🥦"],
    [["hongo", "seta", "champinon", "huitlacoche"], "🍄"], [["queso"], "🧀"],
    [["huevo"], "🥚"], [["tocino", "jamon", "salchicha"], "🥓"],
    [["nuez", "almendra", "cacahuate", "pistache"], "🥜"], [["frijol", "lenteja", "garbanzo", "haba"], "🫘"],
  ];
  const match = icons.find(([needles]) => needles.some((needle) => name.includes(needle)));
  if (match) return match[1];
  if (product.category === "Frutas") return "🍈";
  if (product.category === "Verduras y hierbas") return "🥬";
  if (product.category === "Chiles y pimientos") return "🌶️";
  if (product.category === "Quesos y refrigerados") return "🧀";
  if (product.category === "Semillas, granos y secos") return "🌾";
  return "🛍️";
}

function toneFor(category) {
  return {
    "Frutas": "tone-yellow",
    "Verduras y hierbas": "tone-green",
    "Chiles y pimientos": "tone-red",
    "Quesos y refrigerados": "tone-blue",
    "Semillas, granos y secos": "tone-orange",
    "Abarrotes y condimentos": "tone-purple",
  }[category] || "tone-blue";
}

function cartItems() {
  return Object.values(state.cart);
}

function quantityRules(input, unit) {
  const normalizedUnit = String(unit || "").toUpperCase();
  const rules = {
    PZ: { min: "1", step: "1" },
    G: { min: "1", step: "1" },
    KG: { min: "0.1", step: "0.1" },
  }[normalizedUnit] || { min: "0.1", step: "0.1" };
  input.min = rules.min;
  input.step = rules.step;
}
function unitName(value, quantity = null) {
  const unit = String(value || "").trim().toUpperCase();
  const singular = quantity !== null && Number(quantity) === 1;

  const names = {
    PZ: singular ? "pieza" : "piezas",
    G: singular ? "gramo" : "gramos",
    KG: singular ? "kilogramo" : "kilogramos",
  };

  return names[unit] || String(value || "").trim().toLowerCase();
}

function priceUnitName(value) {
  const unit = normalize(value).replace(/\s+/g, "");

  const names = {
    "100g": "100 gramos",
    "250g": "250 gramos",
    "500g": "500 gramos",
    "g": "gramo",
    "kg": "kilogramo",
    "1kg": "kilogramo",
    "pz": "pieza",
    "pieza": "pieza",
    "caja": "caja",
    "paquete": "paquete",
  };

  return names[unit] || String(value || "").trim().toLowerCase();
}

function allowedUnitsFromSheet(value, fallback = ["PZ", "G", "KG"]) {
  const text = normalize(value);
  if (!text) return [...fallback];
  if (["ambos", "ambas", "todo", "todos", "mixto", "pz g kg", "pieza y peso"].includes(text)) return ["PZ", "G", "KG"];
  if (["pz", "pieza", "piezas", "solo pz", "solo pieza", "pieza completa"].includes(text)) return ["PZ"];
  if (["peso", "kg", "kilo", "kilos", "kilogramo", "kilogramos"].includes(text)) return ["G", "KG"];

  const units = [];
  if (/\b(pz|pieza|piezas)\b/.test(text)) units.push("PZ");
  if (/\b(g|gr|gramo|gramos)\b/.test(text)) units.push("G");
  if (/\b(kg|kilo|kilos|kilogramo|kilogramos)\b/.test(text)) units.push("KG");
  return units.length ? units : [...fallback];
}

function fillUnitSelect(select, allowedUnits) {
  const units = allowedUnits?.length ? allowedUnits : ["PZ", "G", "KG"];

  select.replaceChildren(...units.map((value) => {
    const option = document.createElement("option");
    option.value = value;

    const label = unitName(value);
    option.textContent = label.charAt(0).toUpperCase() + label.slice(1);

    return option;
  }));

  select.disabled = units.length === 1;
}

function openCatalogProduct(product) {
  const selected = state.cart[product.id];
  state.catalogProductId = product.id;
  elements.productDialogEyebrow.textContent = selected ? "Editar producto" : "Agregar al carrito";
  elements.productDialogName.textContent = product.name;
  const allowedUnits = product.allowedUnits?.length ? product.allowedUnits : ["PZ", "G", "KG"];
  fillUnitSelect(elements.productUnit, allowedUnits);
  const requestedUnit = String(selected?.unit || product.defaultUnit).toUpperCase();
  const validRequestedUnit = allowedUnits.includes(requestedUnit);
  elements.productQuantity.value = selected && validRequestedUnit ? selected.quantity : "1";
  elements.productUnit.value = validRequestedUnit
    ? requestedUnit
    : allowedUnits[0];
  elements.productDialogHelp.textContent = allowedUnits.length === 1 && allowedUnits[0] === "PZ"
    ? "Este producto se vende únicamente por pieza completa. Agrega cuántas piezas necesitas."
    : "Elige la cantidad, la unidad y cualquier indicación antes de agregarlo.";
  elements.productNote.value = selected?.note || "";
  elements.saveProduct.textContent = selected ? "Guardar cambios" : "Agregar al carrito";
  quantityRules(elements.productQuantity, elements.productUnit.value);
  elements.productDialog.showModal();
  setTimeout(() => elements.customName.focus(), 0);
}

function closeCatalogProduct() {
  state.catalogProductId = "";
  elements.productDialog.close();
}

function saveCatalogProduct(event) {
  event.preventDefault();
  const product = products.find((item) => item.id === state.catalogProductId);
  if (!product) {
    closeCatalogProduct();
    return;
  }
  state.cart[product.id] = {
    id: product.id,
    name: product.name,
    category: product.category,
    quantity: elements.productQuantity.value,
    unit: elements.productUnit.value,
    note: elements.productNote.value.trim(),
    price: product.price,
    priceUnit: product.priceUnit,
    allowedUnits: product.allowedUnits,
    custom: false,
  };
  saveCart();
  closeCatalogProduct();
  renderProducts();
  renderCart();
}

function removeItem(id) {
  delete state.cart[id];
  saveCart();
  renderProducts();
  renderCart();
  if (elements.confirmationDialog.open) renderFinalOrder();
}

function updateItem(id, field, value) {
  if (!state.cart[id]) return;
  state.cart[id][field] = value;
  saveCart();
}

function makeField(labelText, input) {
  const label = createNode("label", "line-field");
  label.append(createNode("span", "", labelText), input);
  return label;
}

function makeDeleteButton(item) {
  const remove = createNode("button", "delete-button");
  remove.type = "button";
  remove.setAttribute("aria-label", `Eliminar ${item.name} del pedido`);
  const icon = createNode("span", "delete-icon", "🗑️");
  icon.setAttribute("aria-hidden", "true");
  remove.append(icon, createNode("span", "", "Eliminar"));
  remove.addEventListener("click", () => removeItem(item.id));
  return remove;
}

function makeItemEditor(item, compact = false) {
  const editor = createNode("div", compact ? "line-editor compact" : "line-editor");
  const quantity = document.createElement("input");
  quantity.type = "number";
  quantity.min = "0.1";
  quantity.step = "0.1";
  quantity.required = true;
  quantity.value = item.quantity;
  quantity.addEventListener("input", () => updateItem(item.id, "quantity", quantity.value));

  const unit = document.createElement("select");
  unit.required = true;
  const allowedUnits = item.custom ? ["PZ", "G", "KG"] : (item.allowedUnits?.length ? item.allowedUnits : ["PZ", "G", "KG"]);
  fillUnitSelect(unit, allowedUnits);
  unit.value = allowedUnits.includes(String(item.unit).toUpperCase()) ? String(item.unit).toUpperCase() : allowedUnits[0];
  quantityRules(quantity, unit.value);
  unit.addEventListener("change", () => {
    quantityRules(quantity, unit.value);
    updateItem(item.id, "unit", unit.value);
  });

  const fields = createNode("div", "line-pair");
  fields.append(makeField("Cantidad", quantity), makeField("Unidad", unit));

  const note = document.createElement("input");
  note.type = "text";
  note.value = item.note;
  note.placeholder = "Ej. amarillo, rojo y verde; maduro; piezas grandes";
  note.addEventListener("input", () => updateItem(item.id, "note", note.value));

  editor.append(fields, makeField("Nota del producto", note), makeDeleteButton(item));
  return editor;
}

function renderCategories() {
  const categories = ["Todo", ...new Set(products.map((product) => product.category))];
  if (!categories.includes(state.category)) state.category = "Todo";
  elements.categories.replaceChildren();
  categories.forEach((category) => {
    const button = createNode("button", `category-button${state.category === category ? " active" : ""}`, category);
    button.type = "button";
    button.setAttribute("aria-pressed", String(state.category === category));
    button.addEventListener("click", () => {
      state.category = category;
      renderCategories();
      renderProducts();
    });
    elements.categories.append(button);
  });
}

function makeProductVisual(product) {
  const top = createNode("div", `product-top ${toneFor(product.category)}${product.photoUrl ? " has-photo" : ""}`);
  const fallback = createNode("span", "product-icon", iconFor(product));
  fallback.setAttribute("aria-hidden", "true");
  top.append(fallback);

  if (product.photoUrl) {
    const image = document.createElement("img");
    image.className = "product-photo";
    image.src = product.photoUrl;
    image.alt = product.name;
    image.loading = "lazy";
    image.decoding = "async";
    image.draggable = false;
    image.referrerPolicy = "no-referrer";
    image.addEventListener("load", () => fallback.classList.add("photo-loaded"));
    image.addEventListener("error", () => {
      image.remove();
      fallback.classList.remove("photo-loaded");
      top.classList.remove("has-photo");
    });
    top.prepend(image);
  }

  top.append(createNode("span", "product-category", product.category));
  return top;
}

function makeProductCard(product) {
  const card = createNode("article", "product-card");
  const body = createNode("div", "product-body");
  body.append(createNode("h3", "", product.name), makePriceDisplay(product));

  const selected = state.cart[product.id];
  if (selected) {
    const selectedPanel = createNode("div", "selected-product");
    const selectedTop = createNode("div", "selected-product-top");
    selectedTop.append(createNode("span", "added-status", "✓ En el carrito"), createNode("strong", "selected-product-quantity", `${selected.quantity} ${unitName(selected.unit, selected.quantity)}`));
    const summary = createNode("p", "selected-product-note", selected.note || "Sin indicaciones especiales");
    const actions = createNode("div", "selected-product-actions");
    const edit = createNode("button", "edit-button", "Editar");
    edit.type = "button";
    edit.addEventListener("click", () => openCatalogProduct(product));
    actions.append(edit, makeDeleteButton(selected));
    selectedPanel.append(selectedTop, summary, actions);
    body.append(selectedPanel);
  } else {
    const add = createNode("button", "add-button", "Agregar al carrito");
    add.type = "button";
    add.addEventListener("click", () => openCatalogProduct(product));
    body.append(add);
  }

  card.append(makeProductVisual(product), body);
  return card;
}

function makePriceDisplay(product) {
  const hasPrice = String(product.price || "").trim();
  const stage = createNode("div", hasPrice ? "price-stage" : "price-stage pending");
  const pieceOnly = product.allowedUnits?.length === 1 && product.allowedUnits[0] === "PZ";
  stage.append(createNode("span", "price-badge", "PRECIO SEMANAL"));
  if (!hasPrice) {
    stage.append(
      createNode("strong", "pending-price", "CONSULTA PRECIO"),
      createNode("small", "", "Te confirmamos el precio antes de cobrar"),
    );
    if (pieceOnly) stage.append(createNode("span", "sale-mode-badge", "SOLO PIEZA COMPLETA"));
    return stage;
  }

  const main = createNode("div", "weekly-price");
  main.append(createNode("strong", "weekly-price-value", product.price));
  if (product.priceUnit) main.append(createNode("span", "weekly-price-unit", `/ ${product.priceUnit}`));
  stage.append(main, createNode("small", "", "Vigente durante esta semana"));
  if (pieceOnly) stage.append(createNode("span", "sale-mode-badge", "SOLO PIEZA COMPLETA"));
  return stage;
}

function displayPrice(value) {
  const text = String(value || "").trim();

  if (!text || text.startsWith("$")) return text;

  if (/^\d+(?:[.,]\d+)?$/.test(text)) {
    const amount = Number(text.replace(",", "."));

    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  return text;
}

function convertedPriceByUnit(value, unit) {
  const text = String(value || "").trim();

  if (!text) return "";

  const numericPrice = Number(
    text
      .replace(/\$/g, "")
      .replace(/\s/g, "")
      .replace(",", ".")
  );

  if (!Number.isFinite(numericPrice)) {
    return displayPrice(value);
  }

  const normalizedUnit = normalize(unit).replace(/\s+/g, "");

  const conversionFactors = {
    "100g": 0.1,
    "250g": 0.25,
    "500g": 0.5,
    "kg": 1,
    "1kg": 1,
  };

  const factor = conversionFactors[normalizedUnit] ?? 1;
  const convertedPrice = numericPrice * factor;

  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(convertedPrice);
}
function renderProducts() {
  const query = normalize(state.query);
  const visible = products.filter((product) => {
    const categoryMatch = state.category === "Todo" || product.category === state.category;
    return categoryMatch && (!query || normalize(product.name).includes(query));
  });
  elements.productGrid.replaceChildren();
  const showGroups = state.category === "Todo" && !query;
  elements.productGrid.classList.toggle("grouped", showGroups);
  if (showGroups) {
    const groupedCategories = [...new Set(visible.map((product) => product.category))].sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a);
      const bIndex = categoryOrder.indexOf(b);
      if (aIndex < 0 && bIndex < 0) return a.localeCompare(b, "es");
      return (aIndex < 0 ? categoryOrder.length : aIndex) - (bIndex < 0 ? categoryOrder.length : bIndex);
    });
    groupedCategories.forEach((category) => {
      const categoryProducts = visible.filter((product) => product.category === category);
      if (!categoryProducts.length) return;
      const section = createNode("section", "product-group");
      section.append(createNode("h3", "product-group-title", category));
      const grid = createNode("div", "product-group-grid");
      grid.append(...categoryProducts.map(makeProductCard));
      section.append(grid);
      elements.productGrid.append(section);
    });
  } else {
    visible.sort((a, b) => a.name.localeCompare(b.name, "es"));
    elements.productGrid.append(...visible.map(makeProductCard));
  }
  elements.emptyState.hidden = visible.length > 0;
}

function makeCartItem(item) {
  const wrapper = createNode("article", "cart-item");
  const heading = createNode("div", "cart-item-heading");
  const icon = createNode("span", `cart-item-icon ${toneFor(item.category)}`, item.custom ? "＋" : iconFor(item));
  const title = createNode("div");
  title.append(createNode("strong", "", item.name));
  const detail = item.custom
    ? "Producto fuera de catálogo"
    : [item.category, item.price ? `${item.price}${item.priceUnit ? ` / ${item.priceUnit}` : ""}` : "Precio por confirmar"].join(" · ");
  title.append(createNode("small", "", detail));
  heading.append(icon, title);
  wrapper.append(heading, makeItemEditor(item, true));
  return wrapper;
}

function renderCart() {
  const items = cartItems();
  const count = items.length;
  elements.cartCount.textContent = String(count);
  elements.mobileCount.textContent = `${count} ${count === 1 ? "producto" : "productos"}`;
  elements.cartProductCount.textContent = String(count);
  elements.mobileSummary.hidden = count === 0;
  elements.cartEmpty.hidden = count > 0;
  elements.cartContent.hidden = count === 0;
  elements.sendOrder.disabled = count === 0;
  elements.cartItems.replaceChildren(...items.map(makeCartItem));
  elements.cartPriceLabel.textContent = "Total del pedido";
  elements.cartEstimatedTotal.textContent = "Por confirmar";
  elements.cartPriceNote.textContent = "La tienda confirma disponibilidad, peso real por pieza y total final vía WhatsApp.";
}

function renderFinalOrder() {
  const items = cartItems();
  elements.finalOrderCount.textContent = `${items.length} ${items.length === 1 ? "producto" : "productos"}`;
  elements.finalOrderItems.replaceChildren(...items.map(makeCartItem));
  if (!items.length) {
    const empty = createNode("div", "final-order-empty");
    empty.append(createNode("strong", "", "Tu lista quedó vacía"), createNode("span", "", "Agrega al menos un producto antes de abrir WhatsApp."));
    elements.finalOrderItems.append(empty);
  }
  elements.openWhatsApp.disabled = items.length === 0;
}

function openCart() {
  renderCart();
  if (!elements.cartDialog.open) elements.cartDialog.showModal();
}

function openCustom(returnTo = "") {
  state.reopenAfterCustom = returnTo;
  if (elements.cartDialog.open) elements.cartDialog.close();
  if (elements.confirmationDialog.open) elements.confirmationDialog.close();
  elements.customForm.reset();
  elements.customQuantity.value = "1";
  elements.customUnit.value = "PZ";
  quantityRules(elements.customQuantity, elements.customUnit.value);
  elements.customDialog.showModal();
  setTimeout(() => elements.customName.focus(), 0);
}

function closeCustom() {
  const returnTo = state.reopenAfterCustom;
  state.reopenAfterCustom = "";
  elements.customDialog.close();
  if (returnTo === "cart") openCart();
  if (returnTo === "confirmation") {
    renderFinalOrder();
    elements.confirmationDialog.showModal();
  }
}

function addCustomProduct(event) {
  event.preventDefault();
  const returnTo = state.reopenAfterCustom;
  state.reopenAfterCustom = "";
  const id = `especial-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  state.cart[id] = {
    id,
    name: elements.customName.value.trim(),
    category: "Producto especial",
    quantity: elements.customQuantity.value,
    unit: elements.customUnit.value.trim().toUpperCase(),
    note: elements.customNote.value.trim(),
    price: "",
    priceUnit: "",
    custom: true,
  };
  saveCart();
  elements.customDialog.close();
  renderProducts();
  renderCart();
  if (returnTo === "confirmation") {
    renderFinalOrder();
    elements.confirmationDialog.showModal();
  } else {
    openCart();
  }
}

function validateItems() {
  return cartItems().every((item) => Number(item.quantity) > 0 && String(item.unit).trim());
}

function openDeliveryDetails() {
  if (!validateItems()) {
    window.alert("Revisa que todos los productos tengan una cantidad y una unidad válidas.");
    return;
  }

  elements.cartDialog.close();

  if (!elements.detailsDialog.open) {
    elements.detailsDialog.showModal();
  }

  requestAnimationFrame(() => {
    elements.detailsDialog.scrollTop = 0;

    const modalBody = elements.detailsDialog.querySelector(".modal-body");

    if (modalBody) {
      modalBody.scrollTop = 0;
    }
  });
}
function returnToCart() {
  if (elements.detailsDialog.open) {
    elements.detailsDialog.close();
  }

  openCart();
}
function requestConfirmation(event) {
  event.preventDefault();
  if (!elements.customerForm.reportValidity()) return;
  if (!validateItems()) {
    window.alert("Revisa que todos los productos tengan una cantidad y una unidad válidas.");
    return;
  }
  elements.detailsDialog.close();
  renderFinalOrder();
  elements.confirmationDialog.showModal();
  requestAnimationFrame(() => {
  const modalBody = elements.confirmationDialog.querySelector(".modal-body");
  const confirmationTitle = document.querySelector("#confirmationTitle");

  if (modalBody) {
    modalBody.scrollTop = 0;
  }

  if (confirmationTitle) {
    confirmationTitle.focus({ preventScroll: true });
  }
});
}

function orderMessage() {
  const upper = (value) => String(value || "").trim().toLocaleUpperCase("es-MX");
  const lines = cartItems().map((item) => {
    const note = upper(item.note);
    return `${item.quantity} ${upper(item.unit)} DE ${upper(item.name)}${note ? ` (${note})` : ""}`;
  });
  return [
    `*${upper(elements.customerName.value)}*`,
    "",
    upper(elements.streetAddress.value),
    `COLONIA: ${upper(elements.neighborhood.value)}`,
    `ALCALDÍA O MUNICIPIO: ${upper(elements.municipality.value)}`,
    `C.P.: ${upper(elements.postalCode.value)}`,
    `REFERENCIA: ${upper(elements.addressReference.value)}`,
    "",
    `PAGO: ${upper(elements.paymentMethod.value)}`,
    "",
    "ENTREGA: SÁBADO, A MÁS TARDAR 01:00 P. M.",
    "",
    "LISTA DE PRODUCTOS:",
    ...lines,
    "",
    "SOLICITO CONFIRMACIÓN DE DISPONIBILIDAD, TOTAL Y ENTREGA. GRACIAS.",
  ].join("\n");
}

function openWhatsApp() {
  if (!validateItems()) {
    window.alert("Revisa que todos los productos tengan una cantidad válida.");
    return;
  }
  const phone = String(store.whatsapp || "").replace(/\D/g, "");
  const base = phone ? `https://wa.me/${phone}` : "https://wa.me/";
  window.open(`${base}?text=${encodeURIComponent(orderMessage())}`, "_blank", "noopener,noreferrer");
  elements.confirmationDialog.close();
}

function googleSheetQueryUrl(value) {
  const source = String(value || "").trim();
  if (!source) return "";
  const idMatch = source.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!idMatch) return "";
  let gid = "0";
  try {
    const url = new URL(source);
    gid = url.searchParams.get("gid") || url.hash.match(/gid=([0-9]+)/)?.[1] || "0";
  } catch {
    gid = "0";
  }
  return `https://docs.google.com/spreadsheets/d/${idMatch[1]}/gviz/tq?gid=${gid}`;
}

function loadSheetData(queryUrl) {
  return new Promise((resolve, reject) => {
    const callbackName = `dosvSheet${Date.now()}${Math.random().toString(16).slice(2)}`;
    const script = document.createElement("script");
    const timeout = window.setTimeout(() => finish(new Error("La hoja tardó demasiado en responder")), 30000);
    function finish(error, value) {
      window.clearTimeout(timeout);
      script.remove();
      delete window[callbackName];
      if (error) reject(error);
      else resolve(value);
    }
    window[callbackName] = (response) => finish(null, response);
    const url = new URL(queryUrl);
    url.searchParams.set("tqx", `out:json;responseHandler:${callbackName}`);
    url.searchParams.set("dosv", String(Date.now()));
    script.src = url.href;
    script.async = true;
    script.onerror = () => finish(new Error("No se pudo leer Google Sheets"));
    document.head.append(script);
  });
}

function rowsFromSheetResponse(response) {
  if (response?.status !== "ok") throw new Error("Google Sheets devolvió una respuesta inválida");
  return (response.table?.rows || []).map((row) => (row.c || []).map((cell) => {
    if (!cell) return "";
    return cell.f ?? cell.v ?? "";
  }));
}

function sheetColumnMap(headerRow) {
  const headers = headerRow.map(normalize);
  const find = (names, fallback = -1) => {
    const index = headers.findIndex((header) => names.some((name) => header === name || header.includes(name)));
    return index >= 0 ? index : fallback;
  };
  return {
    name: find(["nombre de producto", "producto", "nombre"], 0),
    price: find(["precio de venta"], 7),
    photo: find(["url de foto", "url foto", "foto de producto"], 8),
    saleUnit: 9,
    priceDisplayUnit: 12,
    category: 10,
    active: 11,
  };
}

function sheetCell(row, index) {
  return index >= 0 ? row[index] : "";
}

function productFromSheet(row, localByName, columns) {
  const name = String(sheetCell(row, columns.name) || "").trim();
  if (!name) return null;
  const active = normalize(sheetCell(row, columns.active) || "si");
  if (["no", "false", "0", "inactivo"].includes(active)) return null;
  const normalizedName = normalize(name);
  const local = localByName.get(normalizedName) || localByName.get(sheetNameAliases[normalizedName]);
  const rawSheetPrice = sheetCell(row, columns.price);
  const sheetPhoto = validHttpsUrl(sheetCell(row, columns.photo));
  const sheetCategory = String(sheetCell(row, columns.category) || "").trim();
  const allowedUnits = allowedUnitsFromSheet(
    sheetCell(row, columns.saleUnit),
    local?.allowedUnits || ["PZ", "G", "KG"],
  );
  const defaultUnit = allowedUnits.includes(local?.defaultUnit)
    ? local.defaultUnit
    : allowedUnits[0];

  const rawPriceDisplayUnit = String(
    sheetCell(row, columns.priceDisplayUnit) || ""
  ).trim();

  const priceDisplayUnit = priceUnitName(rawPriceDisplayUnit);

  const sheetPrice = convertedPriceByUnit(
    rawSheetPrice,
    rawPriceDisplayUnit || "kg"
);

const price = sheetPrice || local?.price || "";
  return withDefaultPhoto({
    id: local?.id || slugify(name),
    name: name,
    category: sheetCategory || local?.category || "Otros",
    defaultUnit,
    allowedUnits,
    price,
    priceUnit: priceDisplayUnit || (
  sheetPrice
    ? "kilogramo"
    : priceUnitName(local?.priceUnit || "")
),
    photoUrl: sheetPhoto,
    photoCredit: sheetPhoto ? "Imagen proporcionada por la tienda" : "",
    photoSource: "",
    active: true,
  });
}

function reconcileCart() {
  const current = new Map(products.map((product) => [product.id, product]));
  Object.entries(state.cart).forEach(([id, item]) => {
    if (item.custom) return;
    const product = current.get(id);
    if (!product) {
      delete state.cart[id];
      return;
    }
    Object.assign(item, {
      name: product.name,
      category: product.category,
      price: product.price,
      priceUnit: product.priceUnit,
      allowedUnits: product.allowedUnits,
    });
    if (!product.allowedUnits.includes(String(item.unit).toUpperCase())) item.unit = product.defaultUnit;
  });
  saveCart();
}

function setCatalogStatus(text, status = "ready") {
  if (!elements.catalogStatus) return;
  elements.catalogStatus.textContent = text;
  elements.catalogStatus.dataset.status = status;
}

async function loadSheetCatalog() {
  const queryUrl = googleSheetQueryUrl(store.googleSheetCsvUrl);
  if (!queryUrl) {
    setCatalogStatus("Precios semanales listos");
    return;
  }
  setCatalogStatus("Actualizando precios semanales…", "loading");
  try {
    const rows = rowsFromSheetResponse(await loadSheetData(queryUrl));
    if (rows.length < 2) throw new Error("La hoja no contiene productos");
    const localByName = new Map(window.PRODUCTS.map((product) => [normalize(product.name), product]));
    const firstCell = normalize(rows[0]?.[0]);
    const dataRows = ["nombre", "nombre de producto", "producto"].includes(firstCell) ? rows.slice(1) : rows;
    const columns = sheetColumnMap(rows[0]);
    const remoteProducts = dataRows.map((row) => productFromSheet(row, localByName, columns)).filter(Boolean);
    const uniqueProducts = [...new Map(remoteProducts.map((product) => [product.id, product])).values()];
    if (!uniqueProducts.length) throw new Error("La hoja no contiene nombres de producto");
    products = uniqueProducts.sort((a, b) => {
      const aIndex = categoryOrder.indexOf(a.category);
      const bIndex = categoryOrder.indexOf(b.category);
      const categoryDifference = (aIndex < 0 ? categoryOrder.length : aIndex) - (bIndex < 0 ? categoryOrder.length : bIndex);
      return categoryDifference || a.name.localeCompare(b.name, "es");
    });
    state.lastSheetSync = Date.now();
    reconcileCart();
    renderCategories();
    renderProducts();
    renderCart();
    const time = new Intl.DateTimeFormat("es-MX", { hour: "numeric", minute: "2-digit" }).format(new Date());
    setCatalogStatus(`Precios semanales actualizados · ${time}`);
  } catch (error) {
    console.warn("No se pudo actualizar el catálogo semanal.", error);
    setCatalogStatus("Precios semanales disponibles", "fallback");
  }
}

function initialize() {
  elements.deliveryZone.textContent = store.deliveryZone;
  store.paymentOptions.forEach((method) => {
    const option = document.createElement("option");
    option.value = method;
    option.textContent = method;
    elements.paymentMethod.append(option);
  });
  elements.searchInput.addEventListener("input", (event) => { state.query = event.target.value; renderProducts(); });
  elements.openCart.addEventListener("click", openCart);
  elements.mobileSummary.addEventListener("click", openCart);
  elements.closeCart.addEventListener("click", () => elements.cartDialog.close());
  elements.cartDialog.addEventListener("close", renderProducts);
  elements.productForm.addEventListener("submit", saveCatalogProduct);
  elements.closeProduct.addEventListener("click", closeCatalogProduct);
  elements.cancelProduct.addEventListener("click", closeCatalogProduct);
  elements.productUnit.addEventListener("change", () => {
    quantityRules(elements.productQuantity, elements.productUnit.value);
    elements.productQuantity.value = { PZ: "1", G: "500", KG: "1" }[elements.productUnit.value] || "1";
  });
  elements.openCustom.addEventListener("click", () => openCustom());
  elements.emptyCustom.addEventListener("click", () => openCustom());
  elements.cartCustom.addEventListener("click", () => openCustom("cart"));
  elements.closeCustom.addEventListener("click", closeCustom);
  elements.cancelCustom.addEventListener("click", closeCustom);
  elements.customForm.addEventListener("submit", addCustomProduct);
  elements.customUnit.addEventListener("change", () => {
    quantityRules(elements.customQuantity, elements.customUnit.value);
    elements.customQuantity.value = { PZ: "1", G: "500", KG: "1" }[elements.customUnit.value] || "1";
  });
  elements.sendOrder.addEventListener("click", openDeliveryDetails);
  elements.closeDetails.addEventListener("click", returnToCart);
  elements.backToCart.addEventListener("click", returnToCart);
  elements.customerForm.addEventListener("submit", requestConfirmation);
  elements.cancelConfirmation.addEventListener("click", () => {
  elements.confirmationDialog.close();
  elements.detailsDialog.showModal();
});
  elements.finalAddProduct.addEventListener("click", () => {
    elements.confirmationDialog.close();
    document.querySelector("#catalogo").scrollIntoView({ behavior: "smooth", block: "start" });
  });
  elements.finalAddCustom.addEventListener("click", () => {
    openCustom("confirmation");
  });
  elements.openWhatsApp.addEventListener("click", openWhatsApp);
  [elements.cartDialog, elements.productDialog, elements.customDialog, elements.detailsDialog, elements.confirmationDialog].forEach((dialog) => {
    dialog.addEventListener("click", (event) => {
      if (event.target !== dialog) return;
      if (dialog === elements.customDialog) closeCustom();
      else if (dialog === elements.productDialog) closeCatalogProduct();
      else if (dialog === elements.detailsDialog) returnToCart();
      else dialog.close();
    });
  });
  renderCategories();
  renderProducts();
  renderCart();
  loadSheetCatalog();
  const refreshMilliseconds = Math.max(1, Number(store.sheetRefreshMinutes) || 5) * 60 * 1000;
  window.setInterval(loadSheetCatalog, refreshMilliseconds);
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && Date.now() - state.lastSheetSync > refreshMilliseconds) loadSheetCatalog();
  });
}

initialize();

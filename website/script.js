/* Midtjysk Fælge og Dæk — UI-logik: filtre, produktliste og forespørgsel (kurv). */
(function () {
  "use strict";

  var kr = function (n) { return n.toLocaleString("da-DK") + " kr."; };
  var byId = function (id) { return document.getElementById(id); };

  var catName = {};
  CATEGORIES.forEach(function (c) { catName[c.id] = c.name; });

  /* ---- Wheel-illustration genbrugt i produktkort ---- */
  function wheelSVG() {
    return '' +
      '<svg viewBox="0 0 120 120" role="img" aria-label="Fælg">' +
      '<circle cx="60" cy="60" r="56" fill="#2a2f37"/>' +
      '<circle cx="60" cy="60" r="40" fill="#c2cad4"/>' +
      '<circle cx="60" cy="60" r="11" fill="#3a414b"/>' +
      '<g stroke="#8d96a3" stroke-width="6" stroke-linecap="round">' +
      '<line x1="60" y1="60" x2="60" y2="24"/>' +
      '<line x1="60" y1="60" x2="91" y2="78"/>' +
      '<line x1="60" y1="60" x2="29" y2="78"/>' +
      '<line x1="60" y1="60" x2="89" y2="44"/>' +
      '<line x1="60" y1="60" x2="31" y2="44"/></g>' +
      '<circle cx="60" cy="60" r="5" fill="#e3e8ee"/></svg>';
  }

  /* ---------- State ---------- */
  var state = { type: "alle", category: "alle" };
  var cart = [];

  /* ---------- Kategorier ---------- */
  function renderCategories() {
    var grid = byId("category-grid");
    grid.innerHTML = "";
    CATEGORIES.forEach(function (c) {
      var btn = document.createElement("button");
      btn.className = "category-card";
      btn.type = "button";
      btn.innerHTML =
        '<span class="category-icon" aria-hidden="true">' + c.icon + "</span>" +
        "<h3>" + c.name + "</h3><p>" + c.desc + "</p>";
      btn.addEventListener("click", function () {
        state.category = c.id;
        syncFilterUI();
        renderProducts();
        byId("produkter").scrollIntoView({ behavior: "smooth" });
      });
      grid.appendChild(btn);
    });
  }

  /* ---------- Filter-chips ---------- */
  function makeChip(label, value, group, container) {
    var chip = document.createElement("button");
    chip.className = "chip" + (state[group] === value ? " active" : "");
    chip.type = "button";
    chip.textContent = label;
    chip.dataset.value = value;
    chip.dataset.group = group;
    chip.addEventListener("click", function () {
      state[group] = value;
      syncFilterUI();
      renderProducts();
    });
    container.appendChild(chip);
  }

  function renderFilters() {
    var typeBox = byId("type-filter");
    typeBox.innerHTML = "";
    makeChip("Alle", "alle", "type", typeBox);
    makeChip("Nye", "ny", "type", typeBox);
    makeChip("Brugte", "brugt", "type", typeBox);

    var catBox = byId("cat-filter");
    catBox.innerHTML = "";
    makeChip("Alle", "alle", "category", catBox);
    CATEGORIES.forEach(function (c) { makeChip(c.name, c.id, "category", catBox); });
  }

  function syncFilterUI() {
    document.querySelectorAll(".chip").forEach(function (chip) {
      var g = chip.dataset.group;
      chip.classList.toggle("active", state[g] === chip.dataset.value);
    });
  }

  /* ---------- Produkter ---------- */
  function renderProducts() {
    var grid = byId("product-grid");
    grid.innerHTML = "";
    var list = PRODUCTS.filter(function (p) {
      return (state.type === "alle" || p.condition === state.type) &&
             (state.category === "alle" || p.category === state.category);
    });

    byId("empty-state").hidden = list.length !== 0;

    list.forEach(function (p) {
      var card = document.createElement("article");
      card.className = "product-card";
      var tagClass = p.condition === "ny" ? "tag-ny" : "tag-brugt";
      var tagText = p.condition === "ny" ? "Ny" : "Brugt";
      card.innerHTML =
        '<div class="product-media"><span class="product-tag ' + tagClass + '">' + tagText + "</span>" + wheelSVG() + "</div>" +
        '<div class="product-body">' +
          '<span class="product-cat">' + catName[p.category] + "</span>" +
          "<h3>" + p.name + "</h3>" +
          '<p class="product-spec">' + p.spec + "</p>" +
          '<div class="product-foot">' +
            '<span class="product-price">' + kr(p.price) + "</span>" +
            '<button class="add-btn" type="button" aria-label="Tilføj til forespørgsel">+</button>' +
          "</div>" +
        "</div>";
      card.querySelector(".add-btn").addEventListener("click", function (e) {
        addToCart(p.id);
        var b = e.currentTarget;
        b.classList.add("added"); b.textContent = "✓";
        setTimeout(function () { b.classList.remove("added"); b.textContent = "+"; }, 900);
      });
      grid.appendChild(card);
    });
  }

  /* ---------- Kurv / forespørgsel ---------- */
  function addToCart(id) {
    var item = cart.find(function (i) { return i.id === id; });
    if (item) { item.qty += 1; }
    else {
      var p = PRODUCTS.find(function (x) { return x.id === id; });
      cart.push({ id: p.id, name: p.name, spec: p.spec, price: p.price, qty: 1 });
    }
    renderCart();
  }

  function changeQty(id, delta) {
    var item = cart.find(function (i) { return i.id === id; });
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) cart = cart.filter(function (i) { return i.id !== id; });
    renderCart();
  }

  function removeItem(id) {
    cart = cart.filter(function (i) { return i.id !== id; });
    renderCart();
  }

  function renderCart() {
    var box = byId("cart-items");
    var count = cart.reduce(function (s, i) { return s + i.qty; }, 0);
    var total = cart.reduce(function (s, i) { return s + i.qty * i.price; }, 0);

    var badge = byId("cart-count");
    badge.textContent = count;
    badge.hidden = count === 0;
    byId("cart-total").textContent = kr(total);
    byId("cart-submit").disabled = count === 0;

    if (cart.length === 0) {
      box.innerHTML = '<p class="cart-empty">Din forespørgsel er tom.<br>Tilføj fælge eller dæk fra listen.</p>';
      return;
    }
    box.innerHTML = "";
    cart.forEach(function (i) {
      var row = document.createElement("div");
      row.className = "cart-item";
      row.innerHTML =
        "<div><h4>" + i.name + '</h4><div class="ci-spec">' + i.spec + "</div></div>" +
        '<div class="ci-price">' + kr(i.qty * i.price) + "</div>" +
        '<div class="ci-controls">' +
          '<button type="button" class="ci-dec" aria-label="Færre">−</button>' +
          '<span class="ci-qty">' + i.qty + "</span>" +
          '<button type="button" class="ci-inc" aria-label="Flere">+</button>' +
          '<button type="button" class="ci-remove">Fjern</button>' +
        "</div>";
      row.querySelector(".ci-dec").addEventListener("click", function () { changeQty(i.id, -1); });
      row.querySelector(".ci-inc").addEventListener("click", function () { changeQty(i.id, 1); });
      row.querySelector(".ci-remove").addEventListener("click", function () { removeItem(i.id); });
      box.appendChild(row);
    });
  }

  /* ---------- Drawer open/close ---------- */
  var panel = byId("kurv");
  function openCart(e) { if (e) e.preventDefault(); panel.classList.add("open"); panel.setAttribute("aria-hidden", "false"); }
  function closeCart() { panel.classList.remove("open"); panel.setAttribute("aria-hidden", "true"); }

  byId("cart-button").addEventListener("click", openCart);
  document.querySelectorAll("[data-close-cart]").forEach(function (el) {
    el.addEventListener("click", closeCart);
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeCart(); });

  /* ---------- Forms ---------- */
  byId("cart-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target;
    if (!f.name.value.trim() || !f.phone.value.trim()) return;
    var total = cart.reduce(function (s, i) { return s + i.qty * i.price; }, 0);
    byId("cart-status").textContent =
      "Tak " + f.name.value.trim() + "! Vi kontakter dig på " + f.phone.value.trim() +
      ". Anslået " + kr(total) + " — betales ved afhentning.";
    cart = [];
    renderCart();
    f.reset();
  });

  byId("contact-form").addEventListener("submit", function (e) {
    e.preventDefault();
    var f = e.target;
    if (!f.name.value.trim() || !f.phone.value.trim()) {
      byId("contact-status").textContent = "Udfyld venligst navn og telefon.";
      return;
    }
    byId("contact-status").textContent = "Tak for din besked — vi vender tilbage hurtigst muligt!";
    f.reset();
  });

  /* ---------- Mobil-menu ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var navList = byId("nav-list");
  toggle.addEventListener("click", function () {
    var open = navList.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  navList.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      navList.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- Init ---------- */
  byId("year").textContent = new Date().getFullYear();
  renderCategories();
  renderFilters();
  renderProducts();
  renderCart();
})();

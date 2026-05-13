/**
 * Hankyeol Kim - Portfolio
 *  - Mobile navbar toggle
 *  - Reveal-on-scroll (IntersectionObserver)
 *  - Demo toggle (tabs) on project-detail design system
 */

(function () {
  "use strict";

  /* ---------- Navbar toggle ---------- */
  const navbar = document.querySelector("[data-navbar]");
  if (navbar) {
    const toggle = navbar.querySelector("[data-navbar-toggle]");
    const menu = navbar.querySelector("[data-navbar-menu]");

    const setOpen = (open) => {
      navbar.classList.toggle("is-open", open);
      if (toggle) toggle.setAttribute("aria-expanded", String(open));
      if (menu) menu.setAttribute("aria-hidden", String(!open));
    };

    if (toggle) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.addEventListener("click", () => {
        setOpen(!navbar.classList.contains("is-open"));
      });
    }

    // Close menu when a link inside is clicked (mobile)
    if (menu) {
      menu.addEventListener("click", (e) => {
        const target = e.target.closest("a");
        if (target) setOpen(false);
      });
    }

    // Close menu when crossing back to desktop
    const desktop = window.matchMedia("(min-width: 992px)");
    const onChange = (mql) => {
      if (mql.matches) setOpen(false);
    };
    if (desktop.addEventListener) {
      desktop.addEventListener("change", onChange);
    } else if (desktop.addListener) {
      desktop.addListener(onChange);
    }
  }

  /* ---------- Reveal-on-scroll ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if (reveals.length) {
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              observer.unobserve(entry.target);
            }
          });
        },
        { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
      );
      reveals.forEach((el) => observer.observe(el));
    } else {
      // Fallback: just show all
      reveals.forEach((el) => el.classList.add("is-visible"));
    }
  }

  /* ---------- Demo toggle (tabs) on design-system page ---------- */
  document.querySelectorAll("[data-toggle]").forEach((group) => {
    const options = group.querySelectorAll("[data-toggle-option]");
    options.forEach((opt) => {
      opt.addEventListener("click", () => {
        options.forEach((o) => o.classList.remove("is-active"));
        opt.classList.add("is-active");
      });
    });
  });

  /* ---------- Image-split: size columns by each image's aspect ratio ---------- */
  document.querySelectorAll(".image-split .image-block__image").forEach((img) => {
    const apply = () => {
      if (!img.naturalWidth || !img.naturalHeight) return;
      const ar = img.naturalWidth / img.naturalHeight;
      const block = img.closest(".image-block");
      if (block) block.style.setProperty("--ar", ar);
    };
    if (img.complete && img.naturalWidth) apply();
    else img.addEventListener("load", apply);
  });

  /* ---------- Design Preview: shuffle cards on each load ---------- */
  const dpTrack = document.querySelector(".design-preview__track");
  if (dpTrack) {
    const items = Array.from(dpTrack.children);
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    items.forEach((item) => dpTrack.appendChild(item));
  }

  /* ---------- Generic carousel: drag-to-scroll + arrow buttons ---------- */
  document.querySelectorAll("[data-carousel]").forEach((section) => {
    const track = section.querySelector("[data-carousel-track]");
    const prev = section.querySelector("[data-carousel-prev]");
    const next = section.querySelector("[data-carousel-next]");
    if (!track) return;

    /* Drag-to-scroll (mouse) */
    let isDown = false;
    let startX = 0;
    let startScrollLeft = 0;
    let moved = 0;

    const onDown = (e) => {
      isDown = true;
      moved = 0;
      track.classList.add("is-dragging");
      startX = e.pageX;
      startScrollLeft = track.scrollLeft;
    };

    const onMove = (e) => {
      if (!isDown) return;
      const walk = e.pageX - startX;
      moved = Math.abs(walk);
      track.scrollLeft = startScrollLeft - walk;
    };

    const onUp = () => {
      if (!isDown) return;
      isDown = false;
      track.classList.remove("is-dragging");
    };

    track.addEventListener("mousedown", onDown);
    track.addEventListener("mousemove", onMove);
    track.addEventListener("mouseleave", onUp);
    track.addEventListener("mouseup", onUp);

    // Suppress click on cards if a drag actually happened
    track.addEventListener("click", (e) => {
      if (moved > 6) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);

    /* Arrow buttons -> scroll by one card width, looping at the edges */
    const scrollByCard = (dir) => {
      const card = track.firstElementChild;
      if (!card) return;
      const styles = getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap) || 0;
      const step = card.getBoundingClientRect().width + gap;
      const max = track.scrollWidth - track.clientWidth;
      let target;
      if (dir > 0 && track.scrollLeft >= max - 1) {
        target = 0;
      } else if (dir < 0 && track.scrollLeft <= 1) {
        target = max;
      } else {
        target = track.scrollLeft + dir * step;
      }
      track.scrollTo({ left: target, behavior: "smooth" });
    };

    if (prev) prev.addEventListener("click", () => scrollByCard(-1));
    if (next) next.addEventListener("click", () => scrollByCard(1));
  });

  /* ---------- Project tag filter (home page) ---------- */
  const filtersHost = document.querySelector("[data-project-filters]");
  if (filtersHost) {
    const grid = document.querySelector(".project-grid");
    const cards = grid ? Array.from(grid.querySelectorAll(".project-card")) : [];

    if (cards.length) {
      // Collect tags per card and the unique-tag set
      const tagSet = new Map(); // tag -> count
      cards.forEach((card) => {
        const tags = Array.from(card.querySelectorAll(".project-tag"))
          .map((el) => el.textContent.trim())
          .filter(Boolean);
        card.dataset.tags = tags.join("|");
        tags.forEach((t) => tagSet.set(t, (tagSet.get(t) || 0) + 1));
      });

      const ALL = "All";
      const orderedTags = [ALL, ...Array.from(tagSet.keys())];

      orderedTags.forEach((tag, idx) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "project-filter" + (idx === 0 ? " is-active" : "");
        btn.dataset.filter = tag;
        btn.setAttribute("role", "tab");
        btn.setAttribute("aria-selected", idx === 0 ? "true" : "false");
        const count = tag === ALL ? cards.length : tagSet.get(tag);
        btn.innerHTML = `${tag}<span class="project-filter__count">${count}</span>`;
        filtersHost.appendChild(btn);
      });

      const cols = grid ? Array.from(grid.querySelectorAll(".project-grid__col")) : [];

      const updateEmptyColumns = () => {
        cols.forEach((col) => {
          const hasVisible = col.querySelector(".project-card:not(.is-hidden)");
          col.classList.toggle("is-empty", !hasVisible);
        });
      };

      filtersHost.addEventListener("click", (e) => {
        const btn = e.target.closest(".project-filter");
        if (!btn) return;
        const filter = btn.dataset.filter;

        filtersHost.querySelectorAll(".project-filter").forEach((b) => {
          const active = b === btn;
          b.classList.toggle("is-active", active);
          b.setAttribute("aria-selected", String(active));
        });

        cards.forEach((card) => {
          const tags = (card.dataset.tags || "").split("|");
          const visible = filter === ALL || tags.includes(filter);
          card.classList.toggle("is-hidden", !visible);
        });

        updateEmptyColumns();
      });
    }
  }

  /* ---------- Footer copy-to-clipboard buttons ---------- */
  const copyTextToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch {}
      document.body.removeChild(ta);
      return ok;
    }
  };

  document.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-copy]");
    if (!btn) return;
    e.preventDefault();
    const text = btn.dataset.copy;
    if (!text) return;
    const original = btn.dataset.copyDefault || btn.textContent;
    const ok = await copyTextToClipboard(text);
    btn.textContent = ok ? "복사됨" : "복사 실패";
    btn.classList.add("is-copied");
    clearTimeout(btn._copyTimer);
    btn._copyTimer = setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove("is-copied");
    }, 1400);
  });

  /* ---------- Toast (minimal, single-instance) ---------- */
  let toastEl = null;
  let toastHideTimer = null;
  const showToast = (message, variant = "info", duration = 2800) => {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      toastEl.innerHTML =
        '<span class="toast__dot" aria-hidden="true"></span>' +
        '<span class="toast__msg"></span>';
      document.body.appendChild(toastEl);
      // Force layout so the initial (hidden) state is committed before we
      // toggle the visible class — otherwise the enter transition is skipped.
      void toastEl.offsetWidth;
    }
    toastEl.querySelector(".toast__msg").textContent = message;
    toastEl.dataset.variant = variant;
    toastEl.classList.add("toast--show");
    clearTimeout(toastHideTimer);
    toastHideTimer = setTimeout(
      () => toastEl.classList.remove("toast--show"),
      duration
    );
  };

  /* ---------- Contact modal ---------- */
  const CONTACT_EMAIL = "sk41495133@gmail.com";
  const CONTACT_LINKEDIN = "https://www.linkedin.com/in/hankyeolkim";

  let contactModal = null;
  let lastFocusedTrigger = null;

  const FORM_GROUPS = [
    { name: "project-type", label: "어떤 작업이 필요하신가요?", required: true,
      options: ["랜딩페이지", "회사 홈페이지", "브랜드 사이트", "기존 사이트 리디자인", "기타"] },
    { name: "purpose", label: "웹사이트의 주된 목적은 무엇인가요?", required: true, multi: true,
      hint: "복수 선택 가능",
      options: ["문의 증가", "서비스 소개", "브랜드 신뢰도 강화", "제품 판매", "광고 전환", "기타"] },
    { name: "scope", label: "필요한 작업 범위", required: true,
      options: ["디자인만", "디자인+개발", "기존 사이트 수정", "배포까지", "아직 모르겠음"] },
    { name: "budget", label: "예상 예산 범위", required: true,
      options: ["30만 원 이하", "30~50만 원", "50~100만 원", "100~200만 원", "200만 원 이상", "미정"] },
    { name: "timeline", label: "희망 오픈 일정", required: true,
      options: ["1주 이내", "2주 이내", "1개월 이내", "협의 가능"] },
  ];

  const renderChipGroup = (g, type) =>
    `<div class="contact-modal__chip-group" role="${type === "radio" ? "radiogroup" : "group"}">
      ${g.options.map((opt) => `
        <label class="contact-modal__chip">
          <input type="${type}" name="${g.name}" value="${opt}"${g.required && type === "radio" ? " required" : ""}>
          <span>${opt}</span>
        </label>
      `).join("")}
    </div>`;

  const buildContactModal = () => {
    const root = document.createElement("div");
    root.className = "contact-modal";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-labelledby", "contact-modal-title");
    root.setAttribute("aria-hidden", "true");

    const radioFields = FORM_GROUPS.map((g) => `
      <fieldset class="contact-modal__field">
        <legend class="contact-modal__label">${g.label}${g.required ? ' <span class="contact-modal__req" aria-hidden="true">*</span>' : ""}${g.hint ? ` <span class="contact-modal__hint">${g.hint}</span>` : ""}</legend>
        ${renderChipGroup(g, g.multi ? "checkbox" : "radio")}
      </fieldset>
    `).join("");

    const materials = { name: "materials", required: false,
      options: ["로고", "브랜드 가이드", "텍스트", "이미지", "기존 사이트", "없음"] };

    root.innerHTML = `
      <div class="contact-modal__backdrop" data-contact-close></div>
      <div class="contact-modal__panel contact-modal__panel--form">
        <button type="button" class="contact-modal__close" data-contact-close aria-label="닫기">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
          </svg>
        </button>
        <h2 class="contact-modal__title" id="contact-modal-title">프로젝트 문의</h2>
        <p class="contact-modal__lede">아래 정보를 알려주시면 1영업일 내 회신드립니다.</p>

        <form class="contact-modal__form" data-contact-form novalidate>
          <h3 class="contact-modal__section-heading contact-modal__section-heading--first">프로젝트 정보</h3>
          ${radioFields}

          <div class="contact-modal__field">
            <label class="contact-modal__label" for="cm-reference">참고할 사이트 혹은 레퍼런스가 있다면 알려주세요</label>
            <textarea id="cm-reference" name="reference" class="contact-modal__input contact-modal__input--autosize" rows="1" placeholder="URL 또는 간단한 설명" data-autosize></textarea>
          </div>

          <fieldset class="contact-modal__field">
            <legend class="contact-modal__label">현재 준비된 자료가 있나요?</legend>
            ${renderChipGroup(materials, "checkbox")}
          </fieldset>

          <div class="contact-modal__field">
            <label class="contact-modal__label" for="cm-description">프로젝트에 대해 간단히 설명해주세요</label>
            <textarea id="cm-description" name="description" class="contact-modal__textarea" rows="5" placeholder="현재 상황, 필요한 페이지, 원하는 분위기, 고민 중인 부분 등을 자유롭게 적어주세요."></textarea>
          </div>

          <h3 class="contact-modal__section-heading">연락처 정보</h3>

          <div class="contact-modal__field">
            <label class="contact-modal__label" for="cm-name">이름 <span class="contact-modal__req" aria-hidden="true">*</span></label>
            <input id="cm-name" name="name" type="text" class="contact-modal__input" placeholder="홍길동" autocomplete="name" required>
          </div>

          <div class="contact-modal__field">
            <label class="contact-modal__label" for="cm-email">이메일 <span class="contact-modal__req" aria-hidden="true">*</span></label>
            <input id="cm-email" name="email" type="email" class="contact-modal__input" placeholder="name@example.com" autocomplete="email" inputmode="email" required>
          </div>

          <div class="contact-modal__field">
            <label class="contact-modal__label" for="cm-company">회사 / 소속 <span class="contact-modal__req" aria-hidden="true">*</span></label>
            <input id="cm-company" name="company" type="text" class="contact-modal__input" placeholder="개인은 ‘개인’으로 적어주세요" autocomplete="organization" required>
          </div>

          <fieldset class="contact-modal__field">
            <legend class="contact-modal__label">선호 연락 수단 <span class="contact-modal__req" aria-hidden="true">*</span></legend>
            <div class="contact-modal__chip-group" role="radiogroup" data-channel-group>
              <label class="contact-modal__chip"><input type="radio" name="preferred-channel" value="이메일" checked><span>이메일</span></label>
              <label class="contact-modal__chip"><input type="radio" name="preferred-channel" value="전화"><span>전화</span></label>
              <label class="contact-modal__chip"><input type="radio" name="preferred-channel" value="카톡"><span>카톡</span></label>
            </div>
          </fieldset>

          <div class="contact-modal__field" data-contact-detail-wrap hidden>
            <label class="contact-modal__label" for="cm-contact-detail" data-contact-detail-label>전화번호</label>
            <input id="cm-contact-detail" name="contact-detail" type="text" class="contact-modal__input" data-contact-detail-input placeholder="010-1234-5678" autocomplete="tel">
          </div>

          <div class="contact-modal__field">
            <label class="contact-modal__label" for="cm-referral">유입 경로 <span class="contact-modal__hint">선택 사항</span></label>
            <select id="cm-referral" name="referral" class="contact-modal__select">
              <option value="">선택해 주세요</option>
              <option>검색 (Google · Naver)</option>
              <option>인스타그램</option>
              <option>지인 추천</option>
              <option>포트폴리오 사이트 (Behance · Notefolio 등)</option>
              <option>이전 작업물</option>
              <option>기타</option>
            </select>
          </div>

          <label class="contact-modal__consent">
            <input type="checkbox" name="consent" data-consent required>
            <span>
              <a href="privacy-policy.html" target="_blank" rel="noopener">개인정보처리방침</a>에 따른 개인정보 수집·이용에 동의합니다. <span class="contact-modal__req" aria-hidden="true">*</span>
            </span>
          </label>

          <button type="submit" class="contact-modal__submit">문의 보내기</button>
          <p class="contact-modal__fineprint">또는 <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a> 으로 직접 연락 주세요.</p>
        </form>
      </div>
    `;
    document.body.appendChild(root);

    root.addEventListener("click", (e) => {
      if (e.target.closest("[data-contact-close]")) closeContactModal();
    });

    const form = root.querySelector("[data-contact-form]");

    // Auto-grow any textarea with data-autosize as the user types
    const autosizeFields = form.querySelectorAll("[data-autosize]");
    const autosize = (el) => {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    };
    autosizeFields.forEach((el) => {
      el.addEventListener("input", () => autosize(el));
    });

    // Conditional contact-detail field: visible only when channel is 전화/카톡
    const channelInputs = form.querySelectorAll('input[name="preferred-channel"]');
    const contactDetailWrap = form.querySelector("[data-contact-detail-wrap]");
    const contactDetailLabel = form.querySelector("[data-contact-detail-label]");
    const contactDetailInput = form.querySelector("[data-contact-detail-input]");
    const syncContactDetail = () => {
      const channel = form.querySelector('input[name="preferred-channel"]:checked')?.value;
      if (channel === "전화") {
        contactDetailWrap.hidden = false;
        contactDetailLabel.textContent = "전화번호";
        contactDetailInput.placeholder = "010-1234-5678";
        contactDetailInput.setAttribute("autocomplete", "tel");
        contactDetailInput.setAttribute("inputmode", "tel");
      } else if (channel === "카톡") {
        contactDetailWrap.hidden = false;
        contactDetailLabel.textContent = "카톡 ID";
        contactDetailInput.placeholder = "blinkdesign";
        contactDetailInput.setAttribute("autocomplete", "username");
        contactDetailInput.removeAttribute("inputmode");
      } else {
        contactDetailWrap.hidden = true;
        contactDetailInput.value = "";
      }
    };
    channelInputs.forEach((el) => el.addEventListener("change", syncContactDetail));
    syncContactDetail();

    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const data = new FormData(form);

      // Custom validation for every required group (toast UI, no native popup).
      // We don't call form.reportValidity() because that forces Chrome's
      // built-in validation tooltip even when the form has `novalidate`.
      for (const g of FORM_GROUPS) {
        if (!g.required) continue;
        const count = data.getAll(g.name).length;
        if (count === 0) {
          const verb = g.multi ? "하나 이상 선택해 주세요" : "선택해 주세요";
          showToast(`${g.label.replace(/\?$/, "")} — ${verb}.`, "error");
          const first = form.querySelector(`input[name="${g.name}"]`);
          if (first) first.focus();
          return;
        }
      }

      // Contact info validation
      const name = (data.get("name") || "").trim();
      const email = (data.get("email") || "").trim();
      const company = (data.get("company") || "").trim();
      const channel = data.get("preferred-channel") || "";
      const contactDetail = (data.get("contact-detail") || "").trim();
      const consent = form.querySelector("[data-consent]")?.checked;

      const focusField = (selector) => {
        const el = form.querySelector(selector);
        if (el && typeof el.focus === "function") el.focus();
      };

      if (!name) { showToast("이름을 입력해 주세요.", "error"); focusField("#cm-name"); return; }
      if (!email) { showToast("이메일을 입력해 주세요.", "error"); focusField("#cm-email"); return; }
      // RFC-pragmatic check: non-empty local@domain.tld
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showToast("이메일 형식이 올바르지 않습니다.", "error");
        focusField("#cm-email");
        return;
      }
      if (!company) { showToast("회사 / 소속을 입력해 주세요.", "error"); focusField("#cm-company"); return; }
      if (!channel) {
        showToast("선호 연락 수단을 선택해 주세요.", "error");
        focusField('input[name="preferred-channel"]');
        return;
      }
      if ((channel === "전화" || channel === "카톡") && !contactDetail) {
        const label = channel === "전화" ? "전화번호" : "카톡 ID";
        showToast(`${label}를 입력해 주세요.`, "error");
        focusField("#cm-contact-detail");
        return;
      }
      if (!consent) {
        showToast("개인정보 수집·이용에 동의해 주세요.", "error");
        focusField("[data-consent]");
        return;
      }

      const get = (k) => (data.get(k) || "").trim() || "-";
      const getAll = (k) => data.getAll(k).join(", ") || "-";
      const referral = (data.get("referral") || "").trim();

      const contactLines = [
        `[이름] ${name}`,
        `[이메일] ${email}`,
        `[회사/소속] ${company}`,
        `[선호 연락 수단] ${channel}`,
      ];
      if (contactDetail) {
        const detailLabel = channel === "전화" ? "전화번호" : channel === "카톡" ? "카톡 ID" : "추가 연락처";
        contactLines.push(`[${detailLabel}] ${contactDetail}`);
      }
      if (referral) contactLines.push(`[유입 경로] ${referral}`);

      const lines = [
        ...contactLines,
        "",
        "──────────",
        "",
        `[작업 종류] ${get("project-type")}`,
        `[웹사이트 목적] ${getAll("purpose")}`,
        `[작업 범위] ${get("scope")}`,
        `[예상 예산] ${get("budget")}`,
        `[희망 오픈 일정] ${get("timeline")}`,
        "",
        `[참고 사이트] ${get("reference")}`,
        `[준비된 자료] ${getAll("materials")}`,
        "",
        "[프로젝트 설명]",
        get("description"),
      ];

      const subject = `[BlinkDesign 문의] ${name} · ${data.get("project-type") || ""}`.trim();
      const body = lines.join("\n");
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });

    return root;
  };

  const openContactModal = (trigger) => {
    if (!contactModal) contactModal = buildContactModal();
    lastFocusedTrigger = trigger || null;
    contactModal.classList.add("is-open");
    contactModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    const closeBtn = contactModal.querySelector(".contact-modal__close");
    if (closeBtn) closeBtn.focus();
  };

  const closeContactModal = () => {
    if (!contactModal) return;
    contactModal.classList.remove("is-open");
    contactModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (lastFocusedTrigger && typeof lastFocusedTrigger.focus === "function") {
      lastFocusedTrigger.focus();
    }
  };

  document.addEventListener("click", (e) => {
    const trigger = e.target.closest("[data-contact-trigger]");
    if (!trigger) return;
    e.preventDefault();
    openContactModal(trigger);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && contactModal && contactModal.classList.contains("is-open")) {
      closeContactModal();
    }
  });
})();

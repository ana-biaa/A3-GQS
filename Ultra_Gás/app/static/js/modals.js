(function () {
    const overlay = document.getElementById("modal-overlay");
    const links = document.querySelectorAll(".footer-link");
    const modals = {
        about: document.getElementById("modal-about"),
        privacy: document.getElementById("modal-privacy"),
        contact: document.getElementById("modal-contact"),
    };

    function openModal(name) {
        const modal = modals[name];
        if (!modal) return;
        overlay.setAttribute("aria-hidden", "false");
        modal.setAttribute("aria-hidden", "false");
        // prevent background scroll
        document.body.style.overflow = "hidden";
    }

    function closeModal(modal) {
        modal.setAttribute("aria-hidden", "true");
        overlay.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    }

    links.forEach((link) => {
        link.addEventListener("click", (e) => {
            e.preventDefault();
            const modalName = link.getAttribute("data-modal");
            openModal(modalName);
        });
    });

    // overlay click closes all
    overlay.addEventListener("click", () => {
        Object.values(modals).forEach((m) => m && m.setAttribute("aria-hidden", "true"));
        overlay.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
    });

    // close buttons
    document.querySelectorAll(".modal-close").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            const modal = btn.closest(".modal-card");
            if (modal) closeModal(modal);
        });
    });
})();

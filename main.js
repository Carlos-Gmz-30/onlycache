const CACHE_SW_PATH = "/sw.js";

async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.register(CACHE_SW_PATH);
      console.log("[SW] Registrado:", reg.scope);
    } catch (err) {
      console.error("[SW] Error registrando", err);
    }
  }
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = false;
    s.crossOrigin = "anonymous";
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Error cargando " + src));
    document.head.appendChild(s);
  });
}

function loadCSS(href) {
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = href;
  document.head.appendChild(l);
}

document.addEventListener("DOMContentLoaded", async () => {
  registerServiceWorker();

  const path = location.pathname.split("/").pop() || "index.html";

  if (path === "calendar.html") {
    try {
      await loadScript(
        "https://cdn.jsdelivr.net/npm/fullcalendar@6.1.19/index.global.min.js"
      );
      const calendarEl = document.getElementById("calendar");
      if (calendarEl && window.FullCalendar) {
        const calendar = new FullCalendar.Calendar(calendarEl, {
          initialView: "dayGridMonth",
          height: '100%'
        });
        calendar.render();
      }
    } catch (e) {
      console.error("No se pudo cargar FullCalendar", e);
    }
  }

  if (path === "form.html") {
    try {
      if (!window.jQuery && !window.$) {
        await loadScript("https://code.jquery.com/jquery-3.6.0.min.js");
      }

      const ensureJQuery = async (retries = 20, delay = 50) => {
        for (let i = 0; i < retries; i++) {
          if (window.jQuery || window.$) return true;
          await new Promise((r) => setTimeout(r, delay));
        }
        return false;
      };

      const jqReady = await ensureJQuery();
      if (!jqReady) {
        console.warn(
          "jQuery no está disponible después de la carga. Abortando carga de Select2."
        );
        return;
      }

      loadCSS(
        "https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css"
      );

      try {
        await loadScript(
          "https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"
        );
      } catch (err) {
        console.error("Error cargando Select2 script", err);
        return;
      }

      // Inicializar solo los selects con la clase .js-select2
      try {
        const $ = window.jQuery || window.$;
        if ($) {
          $(document).ready(() => {
            $(".js-select2").select2({ width: "100%" });
          });
        }
      } catch (err) {
        console.warn("Error inicializando Select2", err);
      }
    } catch (e) {
      console.error("No se pudo cargar Select2 o jQuery", e);
    }
  }
});

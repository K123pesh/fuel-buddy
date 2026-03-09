// Service Worker for Push Notifications
self.addEventListener("install", (event) => {
  console.log("Service Worker installing.");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activating.");
  event.waitUntil(clients.claim());
});

self.addEventListener("push", (event) => {
  console.log("Push notification received:", event);

  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: "Refill Reminder", body: event.data.text() };
    }
  }

  const title = data.title || "Fuel Order - Refill Reminder";
  const options = {
    body: data.body || "Time to refuel! Check nearby stations.",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    data: data.url || "/",
    actions: [
      {
        action: "view",
        title: "View Stations",
      },
      {
        action: "dismiss",
        title: "Dismiss",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "view") {
    event.waitUntil(
      clients.openWindow(event.notification.data || "/")
    );
  }
});

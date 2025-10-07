
self.addEventListener("push", (event) => {
    if (!event.data) return;
    const data = event.data.json();

    self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon || '/icon.png',
        badge: data.icon || '/icon.png',
        icon: data.data || {}
    });
});


fetch("/events")
    .then(response => response.json())
    .then(events => {
        const container = document.getElementById("events-container");

        events.forEach(event => {
            const eventCard = document.createElement("div");

            eventCard.innerHTML = `
                <h2>${event.title}</h2>
                <p>${event.description}</p>
                <p><strong>Date:</strong> ${event.date}</p>
                <p><strong>Time:</strong> ${event.time}</p>
                <p><strong>Venue:</strong> ${event.venue}</p>
                <p><strong>Capacity:</strong> ${event.capacity}</p>
                <button class="btn" onclick="registerEvent(${event.eventId})">Register</button>
            `;

            container.appendChild(eventCard);
        });
    })
    .catch(error => {
        console.error("Error loading events:", error);
    });
    function registerEvent(eventId) {
    fetch("/registrations", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            userId: 1,
            eventId: eventId,
            registrationDate: new Date().toISOString().split("T")[0],
            status: "REGISTERED"
        })
    })
    .then(response => {
    if (!response.ok) {
        return response.text().then(message => {
            throw new Error(message);
        });
    }

    return response.json();
})
.then(data => {
    alert("Event registered successfully!");
    window.location.href = "my-registrations.html";
})
    .catch(error => {
    alert(error.message);
    console.error(error);
});
}
const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const user = {
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            password: document.getElementById("password").value,
            role: document.getElementById("role").value
        };

        fetch("/users", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        })
        .then(response => response.json())
        .then(data => {
            alert("Account created successfully!");
            registerForm.reset();
            console.log(data);
        })
        .catch(error => {
            alert("Registration failed!");
            console.error(error);
        });
    });
}
const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const user = {
            email: document.getElementById("loginEmail").value,
            password: document.getElementById("loginPassword").value
        };

        fetch("/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(user)
        })
        .then(response => response.json())
        .then(data => {
            if (data && data.userId) {
    alert("Login successful!");

    if (data.role === "PARTICIPANT") {
        window.location.href = "participant-dashboard.html";
    } else if (data.role === "ORGANIZER") {
    window.location.href = "organizer-dashboard.html";
}
        else if (data.role === "ADMIN") {
        alert("Admin dashboard will be added next.");
    }
}else {
                alert("Invalid email or password!");
            }
        })
        .catch(error => {
            alert("Login failed!");
            console.error(error);
        });
    });
}
const registrationsContainer = document.getElementById("registrations-container");

if (registrationsContainer) {
    fetch("/registrations/user/1")
        .then(response => response.json())
        .then(registrations => {

            if (registrations.length === 0) {
                registrationsContainer.innerHTML = "<p>No registrations found.</p>";
                return;
            }

            registrations.forEach(registration => {

                fetch(`/events/${registration.eventId}`)
                    .then(response => response.json())
                    .then(event => {

                        const card = document.createElement("div");

                        card.innerHTML = `
                            <h2>${event.title}</h2>
                            <p>${event.description}</p>
                            <p><strong>Date:</strong> ${event.date}</p>
                            <p><strong>Time:</strong> ${event.time}</p>
                            <p><strong>Venue:</strong> ${event.venue}</p>
                            <p><strong>Registration Status:</strong> ${registration.status}</p>
                            <p><strong>Registration Date:</strong> ${registration.registrationDate}</p>
                        `;

                        registrationsContainer.appendChild(card);
                    });
            });
        })
        .catch(error => {
            console.error("Error loading registrations:", error);
        });
}

if (registrationsContainer) {
    fetch("/registrations/user/1")
        .then(response => response.json())
        .then(registrations => {
            if (registrations.length === 0) {
                registrationsContainer.innerHTML = "<p>No registrations found.</p>";
                return;
            }

            registrations.forEach(registration => {
                const card = document.createElement("div");

                card.innerHTML = `
                    <h2>Event ID: ${registration.eventId}</h2>
                    <p><strong>Registration Date:</strong> ${registration.registrationDate}</p>
                    <p><strong>Status:</strong> ${registration.status}</p>
                `;

                registrationsContainer.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Error loading registrations:", error);
        });
}
const eventForm = document.getElementById("eventForm");

if (eventForm) {
    eventForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const newEvent = {
            title: document.getElementById("title").value,
            description: document.getElementById("description").value,
            date: document.getElementById("date").value,
            time: document.getElementById("time").value,
            venue: document.getElementById("venue").value,
            capacity: parseInt(document.getElementById("capacity").value),
            organizerId: 1
        };

        fetch("/events", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newEvent)
        })
        .then(response => response.json())
        .then(data => {
            alert("Event created successfully!");
            eventForm.reset();
            console.log(data);
        })
        .catch(error => {
            alert("Event creation failed!");
            console.error(error);
        });
    });
}
const organizerEvents = document.getElementById("organizer-events");

if (organizerEvents) {
    fetch("/events")
        .then(response => response.json())
        .then(events => {

            if (events.length === 0) {
                organizerEvents.innerHTML = "<p>No events created yet.</p>";
                return;
            }

            organizerEvents.innerHTML = "<h2>All Events</h2>";

            events.forEach(event => {

                const card = document.createElement("div");

                card.innerHTML = `
                    <h3>${event.title}</h3>
                    <p>${event.description}</p>
                    <p><strong>Date:</strong> ${event.date}</p>
                    <p><strong>Time:</strong> ${event.time}</p>
                    <p><strong>Venue:</strong> ${event.venue}</p>
                    <p><strong>Capacity:</strong> ${event.capacity}</p>
                `;

                organizerEvents.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Error loading organizer events:", error);
        });
}
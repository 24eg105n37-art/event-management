// Global API Base URL resolver (loaded from config.js or fallback)
const API_BASE_URL = (typeof window !== "undefined" && window.API_BASE_URL)
    ? window.API_BASE_URL
    : "http://localhost:8080";

// ==================== LOAD EVENTS ====================


fetch(`${API_BASE_URL}/events`)
    .then(response => response.json())
    .then(async events => {
        const container = document.getElementById("events-container");

        if (!container) return;

        container.innerHTML = "";

        for (const event of events) {
            let availableSeats = event.capacity;

            try {
                const response = await fetch(
                    `${API_BASE_URL}/registrations/event/${event.eventId}`
                );

                if (response.ok) {
                    const registrations = await response.json();

                    console.log(
                        "Event:", event.eventId,
                        "Registrations:", registrations
                    );

                    const registeredCount = registrations.filter(
                        registration =>
                            registration.status?.toUpperCase() !== "CANCELLED"
                    ).length;

                    availableSeats = Math.max(
                        0,
                        event.capacity - registeredCount
                    );
                }
            } catch (error) {
                console.error("Error loading registrations:", error);
            }

            const eventCard = document.createElement("div");
            eventCard.className = "event-card";

            eventCard.innerHTML = `
                <h3>${event.title}</h3>
                <p>${event.description}</p>
                <p><strong>Date:</strong> ${event.date}</p>
                <p><strong>Time:</strong> ${event.time}</p>
                <p><strong>Venue:</strong> ${event.venue}</p>
                <p><strong>Total Seats:</strong> ${event.capacity}</p>
                <p><strong>Seats Available:</strong> ${availableSeats}</p>

                <button
                    class="btn"
                    ${availableSeats === 0 ? "disabled" : ""}
                    onclick="registerEvent(${event.eventId})">
                    ${availableSeats === 0 ? "Event Full" : "Register"}
                </button>
            `;

            container.appendChild(eventCard);
        }
    })
    .catch(error => {
        console.error("Error loading events:", error);
    });


// ==================== EVENT REGISTRATION ====================


function registerEvent(eventId) {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        alert("Please login first to register for an event.");
        window.location.href = "login.html";
        return;
    }

    fetch(`${API_BASE_URL}/registrations`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            userId: parseInt(userId, 10),
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
        .then(() => {
            alert("Event registered successfully!");
            window.location.href = "my-registrations.html";
        })
        .catch(error => {
            alert(error.message);
            console.error("Registration error:", error);
        });
}


// ==================== USER REGISTRATION ====================

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

        fetch(`${API_BASE_URL}/users`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(user)

        })
            .then(async response => {
                if (!response.ok) {
                    const errorMsg = await response.text();
                    throw new Error(errorMsg || "Registration failed");
                }
                return response.json();
            })
            .then(data => {
                alert("Account created successfully! Please log in.");
                registerForm.reset();
                window.location.href = "login.html";
            })
            .catch(error => {
                alert(error.message || "Registration failed!");
                console.error("Registration error:", error);
            });
    });
}


// ==================== LOGIN ====================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value.trim();

        if (email === "" || password === "") {

            alert("Please enter email and password.");
            return;

        }

        const user = {
            email: email,
            password: password
        };

        fetch(`${API_BASE_URL}/users/login`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(user)

        })
            .then(async response => {

                const text = await response.text();

                console.log("Login status:", response.status);
                console.log("Login response:", text);

                if (!response.ok) {

                    throw new Error(
                        text || "Login request failed. Server returned " + response.status
                    );

                }

                if (!text) {

                    throw new Error("Server returned an empty response.");

                }

                try {

                    return JSON.parse(text);

                } catch (error) {

                    throw new Error("Invalid response from server: " + text);

                }

            })
            .then(data => {

                console.log("Logged-in user:", data);

                if (!data || !data.userId) {

                    alert("Invalid email or password!");
                    return;

                }

                // Save logged-in user information
                localStorage.setItem("userId", data.userId);
                localStorage.setItem("userName", data.name);
                localStorage.setItem("userEmail", data.email);
                localStorage.setItem("userRole", data.role);

                alert("Login successful!");

                if (data.role === "PARTICIPANT") {

                    window.location.href = "participant-dashboard.html";

                } else if (data.role === "ORGANIZER") {

                    window.location.href = "organizer-dashboard.html";

                } else if (data.role === "ADMIN") {

    window.location.href = "admin-dashboard.html";

} else {

                    alert("Unknown user role: " + data.role);

                }

            })
            .catch(error => {

                console.error("LOGIN ERROR:", error);

                alert("Login failed!\n\n" + error.message);

            });
    });
}


// ==================== MY REGISTRATIONS ====================

const registrationsContainer =
    document.getElementById("registrations-container");

if (registrationsContainer) {

    const userId = localStorage.getItem("userId");

    if (!userId) {
        registrationsContainer.innerHTML =
            "<p>Please login first to view your registrations.</p>";
    } else {

        fetch(`${API_BASE_URL}/registrations/user/${userId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error("Failed to load registrations");
                }
                return response.json();
            })
            .then(registrations => {

                if (registrations.length === 0) {
                    registrationsContainer.innerHTML =
                        "<p>No registrations found.</p>";
                    return;
                }

                registrationsContainer.innerHTML = "";

                registrations.forEach(registration => {

                    fetch(`${API_BASE_URL}/events/${registration.eventId}`)
                        .then(response => {
                            if (!response.ok) {
                                throw new Error("Failed to load event");
                            }
                            return response.json();
                        })
                        .then(event => {

                            const card = document.createElement("div");

                            card.className = "event-card";

                            card.innerHTML = `
                                <h2>${event.title}</h2>

                                <p>${event.description}</p>

                                <p>
                                    <strong>Date:</strong>
                                    ${event.date}
                                </p>

                                <p>
                                    <strong>Time:</strong>
                                    ${event.time}
                                </p>

                                <p>
                                    <strong>Venue:</strong>
                                    ${event.venue}
                                </p>

                                <p>
                                    <strong>Registration Status:</strong>
                                    ${registration.status}
                                </p>

                                <p>
                                    <strong>Registration Date:</strong>
                                    ${registration.registrationDate}
                                </p>
<button
    onclick="cancelRegistration(${registration.registrationId})">
    Cancel Registration
</button>
                            `;

                            registrationsContainer.appendChild(card);

                        })
                        .catch(error => {
                            console.error("Event loading error:", error);
                        });
                });

            })
            .catch(error => {

                console.error("Registration loading error:", error);

                registrationsContainer.innerHTML =
                    "<p>Unable to load registrations.</p>";
            });
    }
}


// ==================== CREATE EVENT ====================

const eventForm = document.getElementById("eventForm");

if (eventForm) {

    eventForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const organizerId =
            localStorage.getItem("userId") || 6;

        const newEvent = {

            title: document.getElementById("title").value,
            description: document.getElementById("description").value,
            date: document.getElementById("date").value,
            time: document.getElementById("time").value,
            venue: document.getElementById("venue").value,
            capacity: parseInt(
                document.getElementById("capacity").value
            ),
            organizerId: parseInt(organizerId)

        };

        fetch(`${API_BASE_URL}/events`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(newEvent)

        })
            .then(response => {

                if (!response.ok) {
                    throw new Error("Event creation failed");
                }

                return response.json();

            })
            .then(data => {

                alert("Event created successfully!");

                eventForm.reset();

                console.log(data);

            })
            .catch(error => {

                alert("Event creation failed!");

                console.error("Event error:", error);

            });
    });
}


// ==================== ORGANIZER EVENTS ====================

const organizerEvents =
    document.getElementById("organizer-events");

if (organizerEvents) {

    fetch(`${API_BASE_URL}/events`)

        .then(response => response.json())

        .then(events => {

            if (events.length === 0) {

                organizerEvents.innerHTML =
                    "<p>No events created yet.</p>";

                return;
            }

            organizerEvents.innerHTML = "<h2>All Events</h2>";

            events.forEach(event => {

                const card = document.createElement("div");

                card.innerHTML = `
                    <h3>${event.title}</h3>

                    <p>${event.description}</p>

                    <p>
                        <strong>Date:</strong>
                        ${event.date}
                    </p>

                    <p>
                        <strong>Time:</strong>
                        ${event.time}
                    </p>

                    <p>
                        <strong>Venue:</strong>
                        ${event.venue}
                    </p>

                    <p>
                        <strong>Capacity:</strong>
                        ${event.capacity}
                    </p>
<button
    class="btn"
    onclick="viewParticipants(${event.eventId})">
    View Participants
</button>
                    <button
                        class="btn"
                        onclick="deleteEvent(${event.eventId})">
                        Delete Event
                    </button>
                `;

                organizerEvents.appendChild(card);

            });

        })

        .catch(error => {

            console.error(
                "Error loading organizer events:",
                error
            );

        });
}


// ==================== DELETE EVENT ====================

function deleteEvent(eventId) {

    if (!confirm("Are you sure you want to delete this event?")) {
        return;
    }

    fetch(`${API_BASE_URL}/events/${eventId}`, {

        method: "DELETE"

    })
        .then(response => response.text())

        .then(message => {

            alert(message);

            location.reload();

        })

        .catch(error => {

            alert("Failed to delete event!");

            console.error(error);

        });
}
function viewParticipants(eventId) {

    const container =
        document.getElementById("participants-container");

    container.innerHTML = "<p>Loading participants...</p>";

    fetch(`${API_BASE_URL}/registrations/event/${eventId}`)
        .then(response => response.json())
        .then(registrations => {

            if (registrations.length === 0) {
                container.innerHTML =
                    "<p>No participants registered for this event.</p>";
                return;
            }

            container.innerHTML = "";

            registrations.forEach(registration => {

                fetch(`${API_BASE_URL}/users/${registration.userId}`)
                    .then(response => response.json())
                    .then(user => {

                        const participant = document.createElement("div");

                        participant.innerHTML = `
                            <h3>${user.name}</h3>
                            <p><strong>Email:</strong> ${user.email}</p>
                            <p><strong>Registration Date:</strong> ${registration.registrationDate}</p>
                            <p><strong>Status:</strong> ${registration.status}</p>
                            <hr>
                        `;

                        container.appendChild(participant);

                    });
            });
        })
        .catch(error => {

            container.innerHTML =
                "<p>Failed to load participants.</p>";

            console.error("Participant error:", error);
        });
}
// ==================== ADMIN USER MANAGEMENT ====================

const adminStats = document.getElementById("admin-stats");

if (adminStats) {

    fetch(`${API_BASE_URL}/users`)

        .then(response => response.json())

        .then(users => {

            adminStats.innerHTML = `
                <h2>Registered Users</h2>
                <p>Total Users: ${users.length}</p>
            `;

            users.forEach(user => {

                const userCard = document.createElement("div");

                userCard.innerHTML = `
                    <h3>${user.name}</h3>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Role:</strong> ${user.role}</p>
                    <hr>
                `;

                adminStats.appendChild(userCard);

            });

        })

        .catch(error => {

            console.error("Error loading users:", error);

            adminStats.innerHTML =
                "<p>Failed to load users.</p>";

        });
}
// ==================== ADMIN EVENT MANAGEMENT ====================

if (adminStats) {

    fetch(`${API_BASE_URL}/events`)

        .then(response => response.json())

        .then(events => {

            const eventSection = document.createElement("div");

            eventSection.innerHTML = `
                <h2>Event Management</h2>
            `;

            adminStats.appendChild(eventSection);

            if (events.length === 0) {

                eventSection.innerHTML +=
                    "<p>No events available.</p>";

                return;
            }

            events.forEach(event => {

                const eventCard = document.createElement("div");

                eventCard.innerHTML = `
                    <h3>${event.title}</h3>

                    <p>${event.description}</p>

                    <p>
                        <strong>Date:</strong>
                        ${event.date}
                    </p>

                    <p>
                        <strong>Time:</strong>
                        ${event.time}
                    </p>

                    <p>
                        <strong>Venue:</strong>
                        ${event.venue}
                    </p>

                    <p>
                        <strong>Capacity:</strong>
                        ${event.capacity}
                    </p>

                    <button
                        class="btn"
                        onclick="adminDeleteEvent(${event.eventId})">
                        Delete Event
                    </button>

                    <hr>
                `;

                eventSection.appendChild(eventCard);

            });

        })

        .catch(error => {

            console.error("Error loading events:", error);

        });
}


// ==================== ADMIN DELETE EVENT ====================

function adminDeleteEvent(eventId) {

    if (!confirm("Are you sure you want to delete this event?")) {
        return;
    }

    fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: "DELETE"
    })

        .then(response => response.text())

        .then(message => {

            alert(message);

            location.reload();

        })

        .catch(error => {

            alert("Failed to delete event!");

            console.error(error);

        });
}
// ==================== ADMIN REGISTRATION MANAGEMENT ====================

if (adminStats) {

    fetch(`${API_BASE_URL}/registrations`)

        .then(response => response.json())

        .then(registrations => {

            const registrationSection = document.createElement("div");

            registrationSection.innerHTML = `
                <h2>Registration Management</h2>
            `;

            adminStats.appendChild(registrationSection);

            if (registrations.length === 0) {

                registrationSection.innerHTML +=
                    "<p>No registrations found.</p>";

                return;
            }

            registrations.forEach(registration => {

                const registrationCard =
                    document.createElement("div");

                registrationCard.innerHTML = `
                    <p>
                        <strong>User ID:</strong>
                        ${registration.userId}
                    </p>

                    <p>
                        <strong>Event ID:</strong>
                        ${registration.eventId}
                    </p>

                    <p>
                        <strong>Registration Date:</strong>
                        ${registration.registrationDate}
                    </p>

                    <p>
                        <strong>Status:</strong>
                        ${registration.status}
                    </p>

                    <hr>
                `;

                registrationSection.appendChild(
                    registrationCard
                );

            });

        })

        .catch(error => {

            console.error(
                "Error loading registrations:",
                error
            );

        });
}
// ==================== CANCEL REGISTRATION ====================

function cancelRegistration(registrationId) {

    const confirmCancel = confirm(
        "Are you sure you want to cancel this registration?"
    );

    if (!confirmCancel) {
        return;
    }

    fetch(`${API_BASE_URL}/registrations/${registrationId}`, {
        method: "DELETE"
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Cancellation failed");
            }

            alert("Registration cancelled successfully!");
            window.location.reload();
        })
        .catch(error => {
            console.error("Cancellation error:", error);
            alert("Unable to cancel registration. Please try again.");
        });
}
// ==================== ADMIN ACCESS CONTROL ====================

if (window.location.pathname.endsWith("admin-dashboard.html")) {

    const userRole = localStorage.getItem("userRole");

    if (userRole !== "ADMIN") {
        alert("Access denied! Admin only.");

        if (userRole === "ORGANIZER") {
            window.location.href = "organizer-dashboard.html";
        } else {
            window.location.href = "participant-dashboard.html";
        }
    }
}
// ==================== ORGANIZER ACCESS CONTROL ====================

if (window.location.pathname.endsWith("organizer-dashboard.html")) {

    const userRole = localStorage.getItem("userRole");

    if (userRole !== "ORGANIZER") {
        alert("Access denied! Organizers only.");

        if (userRole === "ADMIN") {
            window.location.href = "admin-dashboard.html";
        } else {
            window.location.href = "participant-dashboard.html";
        }
    }
}
// ==================== PARTICIPANT ACCESS CONTROL ====================

if (window.location.pathname.endsWith("participant-dashboard.html")) {

    const userRole = localStorage.getItem("userRole");

    if (userRole !== "PARTICIPANT") {
        alert("Access denied! Participants only.");

        if (userRole === "ADMIN") {
            window.location.href = "admin-dashboard.html";
        } else if (userRole === "ORGANIZER") {
            window.location.href = "organizer-dashboard.html";
        } else {
            window.location.href = "login.html";
        }
    }
}
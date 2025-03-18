import './bootstrap';

import Alpine from 'alpinejs';

window.Alpine = Alpine;

Alpine.start();

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
});

window.Echo.channel("chirps")
    .listen("ChirpCreated", (event) => {
        console.log("New Chirp:", event);

        // Find the chirp list
        const chirpList = document.getElementById("chirp-list");
        if (!chirpList) return;

        // Create new chirp element
        const chirpItem = document.createElement("p");
        chirpItem.innerHTML = `<strong>${event.user.name}:</strong> ${event.chirp.message}`;

        // Prepend the new chirp
        chirpList.prepend(chirpItem);
    });


    document.addEventListener("DOMContentLoaded", () => {
        const chirpList = document.querySelector(".divide-y");

        // Remove existing listeners to prevent duplicates
        window.Echo.leaveChannel("chirps");

        window.Echo.channel("chirps").listen("ChirpCreated", (event) => {
            // Prevent duplicate chirps by checking if it already exists
            const existingChirps = chirpList.querySelectorAll(".chirp-item");
            if ([...existingChirps].some(chirp => chirp.dataset.chirpId == event.id)) {
                return; // If the chirp already exists, do nothing
            }

            const newChirp = document.createElement("div");
            newChirp.classList.add("p-6", "flex", "space-x-2", "chirp-item");
            newChirp.dataset.chirpId = event.id; // Set unique ID to prevent duplicates

            newChirp.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-600 -scale-x-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4-8 9-8s9 3.582 9 8z" />
                </svg>
                <div class="flex-1">
                    <div class="flex justify-between items-center">
                        <div>
                            <span class="text-gray-800">${event.user}</span>
                            <small class="ml-2 text-sm text-gray-600">${event.created_at}</small>
                        </div>
                    </div>
                    <p class="mt-4 text-lg text-gray-900">${event.message}</p>
                </div>
            `;

            chirpList.insertAdjacentElement("afterbegin", newChirp);
        });
    });

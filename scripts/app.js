document.addEventListener('DOMContentLoaded', () => {
    const spinButton = document.getElementById('spinButton');
    const addCandidateButton = document.getElementById('addCandidateButton');
    const clearAllButton = document.getElementById('clearAllButton');
    const restartButton = document.getElementById('restartButton'); // Get restart button element
    const resultDisplay = document.getElementById('selectedCandidatesList');
    const candidateList = document.getElementById('candidateList');
    const candidateCount = document.getElementById('candidateCount'); // Get candidate count element
    const newCandidatesInput = document.getElementById('newCandidates');
    const maxSpinNumbersInput = document.getElementById('maxSpinNumbers');
    const spinAudio = document.getElementById('spinAudio'); // Get audio element
    const winSound = document.getElementById('winSound'); // Get win sound element
    const winnerCount = document.getElementById('winnerCount'); // Get winner count element
    const winnerModal = document.getElementById('winnerModal'); // Get modal element
    const winnerName = document.getElementById('winnerName'); // Get winner name element
    const closeModal = document.querySelector('.close'); // Get close button element
    const hamburgerMenu = document.getElementById('hamburgerMenu'); // Get hamburger menu element
    const sidebar = document.getElementById('sidebar'); // Get sidebar element
    const ul = document.createElement('ul');
    let candidates = getStoredData('candidates') || Array.from({ length: 600 }, (_, i) => `Candidate ${i + 1}`);
    let selectedCandidates = getStoredData('selectedCandidates') || [];
      
    function renderCandidates() {
        ul.innerHTML = '';
        candidates.forEach(candidate => {
            const li = document.createElement('li');
            li.textContent = candidate;
            if (selectedCandidates.includes(candidate)) {
                li.classList.add('highlight'); // Highlight selected candidate
            }
            ul.appendChild(li);
        });
        candidateList.innerHTML = ''; // Clear any existing content
        candidateList.appendChild(ul);
        candidateCount.textContent = candidates.length; // Update candidate count
        renderSelecedCandidates();
    }

    function renderSelecedCandidates(){
        // Render selected candidates
        resultDisplay.innerHTML = ''; // Clear previous results
        selectedCandidates.forEach(candidate => {
            const li = document.createElement('li');
            li.innerHTML = `<i class="fa-solid fa-crown"></i> ${candidate}`; // Add icon to list item
            resultDisplay.appendChild(li);
        });
        winnerCount.textContent = selectedCandidates.length; // Update winner count
    };

    function spinWheel() {
        const maxSpinNumbers = parseInt(maxSpinNumbersInput.value) || 1;

        if (selectedCandidates.length >= maxSpinNumbers) { // Check if the maximum number of spins has been reached
            alert('You have reached the maximum number of spins');
            return;
        }
        if (candidates.length <= maxSpinNumbers) {
            alert('Not enough candidates to spin');
            return;
        }

        spinButton.disabled = true; // Disable the spin button
        spinButton.classList.add('spin-button-disabled'); // Add disabled class
        spinAudio.play(); // Play audio when spinning
        
        const listHeight = ul.scrollHeight;
        const randomScroll = Math.ceil(listHeight / 1.05); // Random scroll position
        const spinDuration = 5000; // 5 seconds

        candidateList.scrollTop = 0;
        ul.style.transition = 'none';
        ul.style.transform = 'none';

        // Force reflow
        ul.offsetHeight;

        ul.style.transition = `transform ${spinDuration}ms ease-out`;
        ul.style.transform = `translateY(-${randomScroll}px)`;

        setTimeout(() => {
            const selectedCandidateIndex = uniqueIndex();
            const selectedCandidate = candidates[selectedCandidateIndex];
            selectedCandidates.push(selectedCandidate);
            storeData('selectedCandidates', selectedCandidates); // Store selected candidates

            // Highlight selected candidate
            ul.children[selectedCandidateIndex].classList.add('highlight');

            renderSelecedCandidates();
            // Center the selected candidate
            const selectedCandidateElement = ul.children[selectedCandidateIndex];
            const offsetTop = selectedCandidateElement.offsetTop;
            const containerHeight = candidateList.clientHeight;
            const elementHeight = selectedCandidateElement.clientHeight;
            const scrollPosition = offsetTop - (containerHeight / 2) + (elementHeight / 2);

            ul.style.transition = 'none';
            ul.style.transform = 'none';
            // Force reflow
            ul.offsetHeight;
            candidateList.scrollTop = scrollPosition;

            // Show modal with winner's name
            winnerName.textContent = selectedCandidate;
            winnerModal.style.display = 'block';
            winSound.play(); // Play win sound

            spinButton.disabled = false; // Re-enable the spin button
            spinButton.classList.remove('spin-button-disabled'); // Remove disabled class
            winnerCount.textContent = selectedCandidates.length; // Update winner count
        }, spinDuration);
    }

    function addCandidates() {
        const newCandidates = newCandidatesInput.value.trim().split('\n').map(name => name.trim()).filter(name => name);
        const uniqueNewCandidates = newCandidates.filter((name, index) => !candidates.includes(name) && newCandidates.indexOf(name) === index);
        if (uniqueNewCandidates.length > 0) {
            candidates.push(...uniqueNewCandidates);
            storeData('candidates', candidates); // Store candidates
            renderCandidates();
            newCandidatesInput.value = '';
        } else {
            alert('No new unique candidates to add.');
        }
    }

    function clearAll() {
        candidates.length = 0;
        selectedCandidates.length = 0;
        storeData('candidates', candidates); // Store candidates
        storeData('selectedCandidates', selectedCandidates); // Store selected candidates
        renderCandidates();
        resultDisplay.innerHTML = '';
        winnerCount.textContent = selectedCandidates.length; // Update winner count
    }

    function restart() {
        selectedCandidates.length = 0;
        storeData('selectedCandidates', selectedCandidates); // Store selected candidates
        renderCandidates();
        renderSelecedCandidates();
    }

    function uniqueIndex() {
        var randIndex = Math.floor(Math.random() * candidates.length);
        if (selectedCandidates.includes(candidates[randIndex])) {
            return uniqueIndex();
        } else {
            return randIndex;
        }
    }

    function storeData(key, data) {
        const now = new Date();
        const item = {
            value: data,
        };
        localStorage.setItem(key, JSON.stringify(item));
    }

    function getStoredData(key) {
        const itemStr = localStorage.getItem(key);
        if (!itemStr) {
            return null;
        }
        const item = JSON.parse(itemStr);
        return item.value;
    }

    // Close modal when the user clicks on <span> (x)
    closeModal.onclick = function() {
        closeModalFn();
    }

    function closeModalFn(){
        winnerModal.style.display = 'none';
        winSound.pause(); // Play win sound
        winSound.currentTime = 0; // Reset win sound
    }

    // Close modal when the user clicks anywhere outside of the modal
    window.onclick = function(event) {
        if (event.target == winnerModal) {
            closeModalFn();
        }
    }

    // Close sidebar when the user clicks anywhere outside of the sidebar
    window.addEventListener('click', (event) => {
        if (!sidebar.contains(event.target) && !hamburgerMenu.contains(event.target)) {
            sidebar.classList.remove('open');
            hamburgerMenu.innerHTML = '<i class="fas fa-bars"></i>'; // Change back to hamburger icon
            hamburgerMenu.style.color = '#00354E'; // Change color back
        }
    });

    // Open sidebar when hamburger menu is clicked
    hamburgerMenu.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent the click event from propagating to the window
        sidebar.classList.toggle('open');
        if (sidebar.classList.contains('open')) {
            hamburgerMenu.innerHTML = '<i class="fa-solid fa-arrow-right-from-bracket"></i>'; // Change to 'X' icon
            hamburgerMenu.style.color = '#EF7D00'; // Change color
        } else {
            hamburgerMenu.innerHTML = '<i class="fas fa-bars"></i>'; // Change back to hamburger icon
            hamburgerMenu.style.color = '#00354E'; // Change color back
        }
    });

    spinButton.addEventListener('click', spinWheel);
    addCandidateButton.addEventListener('click', addCandidates);
    clearAllButton.addEventListener('click', clearAll);
    restartButton.addEventListener('click', restart); // Add event listener for restart button

    renderCandidates();
});
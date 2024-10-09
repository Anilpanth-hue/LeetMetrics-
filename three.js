document.addEventListener("DOMContentLoaded", function() {

    const searchButton = document.getElementById("search-btn");
    const usernameInput = document.getElementById("user-input");
    const statsContainer = document.querySelector(".stats-container");
    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");
    const easyLabel = document.getElementById("easy-label");
    const mediumLabel = document.getElementById("medium-label");
    const hardLabel = document.getElementById("hard-label");
    const cardStatsContainer = document.querySelector(".stats-cards");

    // Show spinner
    function showLoadingSpinner() {
        searchButton.innerHTML = '<span class="spinner"></span> Searching...';
    }

    // Hide spinner
    function hideLoadingSpinner() {
        searchButton.textContent = "Search";
    }

    // Return true or false based on username regex
    function validateUsername(username) {
        if (username.trim() === "") {
            alert("Username should not be empty");
            return false;
        }
        const regex = /^[a-zA-Z0-9_-]{1,15}$/;
        const isMatching = regex.test(username);
        if (!isMatching) {
            alert("Invalid Username");
        }
        return isMatching;
    }

    async function fetchUserDetails(username) {
        try {
            showLoadingSpinner();
            searchButton.disabled = true;

            // Clear old data if any
            clearPreviousData();

            const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            const targetUrl = 'https://leetcode.com/graphql/';

            const myHeaders = new Headers();
            myHeaders.append("content-type", "application/json");

            const graphqlQuery = JSON.stringify({
                query: `
                query userSessionProgress($username: String!) {
                    allQuestionsCount {
                        difficulty
                        count
                    }
                    matchedUser(username: $username) {
                        submitStats {
                            acSubmissionNum {
                                difficulty
                                count
                                submissions
                            }
                            totalSubmissionNum {
                                difficulty
                                count
                                submissions
                            }
                        }
                    }
                }
                `,
                variables: { "username": `${username}` }
            });

            const requestOptions = {
                method: "POST",
                headers: myHeaders,
                body: graphqlQuery,
            };

            const response = await fetch(proxyUrl + targetUrl, requestOptions);

            if (!response.ok) {
                throw new Error("Unable to fetch user details. Check username or try again later.");
            }

            const parsedData = await response.json();
            if (!parsedData.data.matchedUser) {
                throw new Error("User not found. Please enter a valid username.");
            }

            displayUserData(parsedData);
        } catch (error) {
            statsContainer.innerHTML = `<p>${error.message}</p>`;
        } finally {
            hideLoadingSpinner();
            searchButton.disabled = false;
        }
    }

    function updateProgress(solved, total, label, circle) {
        const progressPercentage = total > 0 ? (solved / total) * 100 : 0;
        circle.style.setProperty("--progress-degree", `${progressPercentage}%`);
        label.textContent = `${solved}/${total}`;
    }

    function displayUserData(parsedData) {
        const totalQues = parsedData.data.allQuestionsCount[0]?.count || 0;
        const totalEasyQues = parsedData.data.allQuestionsCount[1]?.count || 0;
        const totalMediumQues = parsedData.data.allQuestionsCount[2]?.count || 0;
        const totalHardQues = parsedData.data.allQuestionsCount[3]?.count || 0;

        const solvedTotalQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[0]?.count || 0;
        const solvedTotalEasyQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[1]?.count || 0;
        const solvedTotalMediumQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[2]?.count || 0;
        const solvedTotalHardQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[3]?.count || 0;

        // Update progress circles for Easy, Medium, Hard
        updateProgress(solvedTotalEasyQues, totalEasyQues, easyLabel, easyProgressCircle);
        updateProgress(solvedTotalMediumQues, totalMediumQues, mediumLabel, mediumProgressCircle);
        updateProgress(solvedTotalHardQues, totalHardQues, hardLabel, hardProgressCircle);

        const cardsData = [
            { label: "Overall Submissions", value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[0]?.submissions || 0 },
            { label: "Overall Easy Submissions", value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[1]?.submissions || 0 },
            { label: "Overall Medium Submissions", value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[2]?.submissions || 0 },
            { label: "Overall Hard Submissions", value: parsedData.data.matchedUser.submitStats.totalSubmissionNum[3]?.submissions || 0 }
        ];

        cardStatsContainer.innerHTML = cardsData.map(
            data =>
                `<div class="card">
                    <h4>${data.label}</h4>
                    <p>${data.value}</p>
                </div>`
        ).join("");
    }

    function clearPreviousData() {
        easyLabel.textContent = "0/0";
        mediumLabel.textContent = "0/0";
        hardLabel.textContent = "0/0";

        cardStatsContainer.innerHTML = ""; // Clear previous card data

        // Reset progress circles
        easyProgressCircle.style.setProperty("--progress-degree", "0%");
        mediumProgressCircle.style.setProperty("--progress-degree", "0%");
        hardProgressCircle.style.setProperty("--progress-degree", "0%");
    }

    searchButton.addEventListener('click', function () {
        const username = usernameInput.value.trim();
        if (validateUsername(username)) {
            fetchUserDetails(username);
        }
    });

});

// =============================================================
// AAROHAN GLOBAL
// =============================================================

const STORAGE_KEY = "aarohan_state";

// =============================================================
// DATE - INDIA LOCAL DATE
// =============================================================

function TODAY() {

    const now = new Date();

    const year =
        now.getFullYear();

    const month =
        String(
            now.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            now.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

// =============================================================
// DEFAULT STATE
// =============================================================

const DEFAULT_STATE = {
    currentUser: null,

    users: {
        AG1001: {
            userId: "AG1001",
            name: "Master Admin",
            mobile: "9999999999",
            password: "admin",
            sponsorId: "",
            status: "ACTIVE",

            // Multiple packages support
            packages: [],

            // Total of all active packages
            package: 0,

            // Total daily ROI of all active packages
            roiDaily: 0,

            walletBal: 0,
            upiId: "",
            totalEarned: 0,
            roiEarned: 0,
            teamEarned: 0,
            referrals: 0,

            lastRoiDate: TODAY()
        }
    },

    deposits: [],
    withdrawals: []
};

// =============================================================
// CLONE
// =============================================================

function cloneData(data) {
    return JSON.parse(JSON.stringify(data));
}

// =============================================================
// LOAD
// =============================================================

function loadState() {

    try {

        const saved =
            localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return cloneData(DEFAULT_STATE);
        }

        const parsed = JSON.parse(saved);

        const state = {

            currentUser:
                parsed.currentUser || null,

            users:
                parsed.users &&
                typeof parsed.users === "object"
                    ? parsed.users
                    : {},

            deposits:
                Array.isArray(parsed.deposits)
                    ? parsed.deposits
                    : [],

            withdrawals:
                Array.isArray(parsed.withdrawals)
                    ? parsed.withdrawals
                    : []
        };

        if (!state.users.AG1001) {

            state.users.AG1001 =
                cloneData(
                    DEFAULT_STATE.users.AG1001
                );
        }

        return state;

    } catch (error) {

        console.error("LOAD ERROR:", error);

        return cloneData(DEFAULT_STATE);
    }
}

let appState = loadState();

// =============================================================
// ENSURE ADMIN
// =============================================================

function ensureAdminExists() {

    if (!appState.users) {
        appState.users = {};
    }

    if (!appState.users.AG1001) {

        appState.users.AG1001 =
            cloneData(DEFAULT_STATE.users.AG1001);

    } else {

        // MASTER ADMIN LOGIN RESET
        appState.users.AG1001.userId = "AG1001";
        appState.users.AG1001.name = "Master Admin";
        appState.users.AG1001.password = "admin";
        appState.users.AG1001.status = "ACTIVE";
    }

    // Save corrected admin login
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(appState)
    );
}

ensureAdminExists();

// =============================================================
// SAVE
// =============================================================

function saveState() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(appState)
        );

        updateDashboard();
        renderCurrentPage();

    } catch (error) {

        console.error("SAVE ERROR:", error);
    }
}

// =============================================================
// CURRENT USER
// =============================================================

function getCurrentUser() {

    if (!appState.currentUser) {
        return null;
    }

    return (
        appState.users[
            appState.currentUser
        ] || null
    );
}

// =============================================================
// MONEY
// =============================================================

function money(value) {

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "0.00";
    }

    return number.toFixed(2);
}
// =============================================================
// PROFESSIONAL TOAST NOTIFICATION
// =============================================================

function showToast(message, type = "warning") {

    let toast = document.getElementById("agToast");

    if (!toast) {

        toast = document.createElement("div");

        toast.id = "agToast";

        toast.style.cssText = `
            position:fixed;
            left:50%;
            bottom:25px;
            transform:translateX(-50%) translateY(20px);
            width:calc(100% - 40px);
            max-width:420px;
            padding:15px 18px;
            border-radius:14px;
            background:#111827;
            color:#f8fafc;
            box-shadow:0 12px 35px rgba(0,0,0,.45);
            border:1px solid rgba(255,255,255,.10);
            display:flex;
            align-items:center;
            gap:12px;
            font-size:14px;
            font-weight:600;
            z-index:99999;
            opacity:0;
            transition:.25s ease;
        `;

        document.body.appendChild(toast);
    }

    let icon = "⚠️";

    if (type === "success") icon = "✅";
    if (type === "error") icon = "❌";

    toast.innerHTML =
        `<span style="font-size:20px;">${icon}</span>
         <span>${escapeHTML(message)}</span>`;

    toast.style.opacity = "1";

    toast.style.transform =
        "translateX(-50%) translateY(0)";

    clearTimeout(window.agToastTimer);

    window.agToastTimer =
        setTimeout(function() {

            toast.style.opacity = "0";

            toast.style.transform =
                "translateX(-50%) translateY(20px)";

        }, 3000);
}

// =============================================================
// PROFESSIONAL WITHDRAWAL POPUP
// =============================================================

function showWithdrawPopup(message, type = "warning") {

    const popup =
        document.getElementById("withdrawPopup");

    const messageElement =
        document.getElementById("withdrawPopupMessage");

    const icon =
        document.getElementById("withdrawPopupIcon");

    if (!popup || !messageElement) {
        return;
    }

    messageElement.innerText = message;

    if (icon) {

        if (type === "success") {

            icon.innerText = "✓";

            icon.style.background =
                "rgba(34,197,94,.12)";

            icon.style.borderColor =
                "#22c55e";

        } else if (type === "error") {

            icon.innerText = "✕";

            icon.style.background =
                "rgba(239,68,68,.12)";

            icon.style.borderColor =
                "#ef4444";

        } else {

            icon.innerText = "⚠️";

            icon.style.background =
                "rgba(56,189,248,.12)";

            icon.style.borderColor =
                "#38bdf8";
        }
    }

    popup.style.display = "flex";

    document.body.style.overflow = "hidden";
}


// =============================================================
// CLOSE WITHDRAWAL POPUP
// =============================================================

window.closeWithdrawPopup =
function() {

    const popup =
        document.getElementById("withdrawPopup");

    if (popup) {

        popup.style.display = "none";
    }

    document.body.style.overflow = "";
};
// =============================================================
// PROFESSIONAL ADMIN ACTION POPUP
// =============================================================

function showAdminActionPopup(
    title,
    message,
    type = "success",
    details = {}
) {

    let popup =
        document.getElementById("adminActionPopup");

    if (popup) {
        popup.remove();
    }

    let icon = "✓";

    if (type === "error") {
        icon = "✕";
    }

    if (type === "warning") {
        icon = "!";
    }

    popup =
        document.createElement("div");

    popup.id =
        "adminActionPopup";

    popup.innerHTML = `

        <div class="admin-action-overlay">

            <div class="admin-action-box">

                <div class="admin-action-icon ${type}">
                    ${icon}
                </div>

                <h2>
                    ${escapeHTML(title)}
                </h2>

                <p class="admin-action-message">
                    ${escapeHTML(message)}
                </p>

                ${
                    details.userId || details.amount
                    ? `
                    <div class="admin-action-details">

                        ${
                            details.userId
                            ? `
                            <div>
                                <span>User ID</span>
                                <strong>
                                    ${escapeHTML(details.userId)}
                                </strong>
                            </div>
                            `
                            : ""
                        }

                        ${
                            details.amount
                            ? `
                            <div>
                                <span>Amount</span>
                                <strong>
                                    ₹${money(details.amount)}
                                </strong>
                            </div>
                            `
                            : ""
                        }

                    </div>
                    `
                    : ""
                }

                <button
                    type="button"
                    class="admin-action-close"
                    onclick="closeAdminActionPopup()"
                >
                    ✓ &nbsp; Close
                </button>

            </div>

        </div>
    `;

    document.body.appendChild(popup);

    document.body.style.overflow = "hidden";
}


// =============================================================
// CLOSE ADMIN ACTION POPUP
// =============================================================

window.closeAdminActionPopup =
function() {

    const popup =
        document.getElementById(
            "adminActionPopup"
        );

    if (popup) {
        popup.remove();
    }

    document.body.style.overflow = "";
};


// =============================================================
// ADMIN ACTION POPUP CSS
// =============================================================

if (!document.getElementById("adminActionPopupCSS")) {

    const style =
        document.createElement("style");

    style.id =
        "adminActionPopupCSS";

    style.innerHTML = `

        .admin-action-overlay {

            position:fixed;
            inset:0;

            background:rgba(2,6,23,.82);

            backdrop-filter:blur(10px);
            -webkit-backdrop-filter:blur(10px);

            display:flex;
            align-items:center;
            justify-content:center;

            padding:20px;

            z-index:999999;
        }


        .admin-action-box {

            width:100%;
            max-width:420px;

            background:
                linear-gradient(
                    145deg,
                    #0f172a,
                    #111827
                );

            border:1px solid
                rgba(255,255,255,.12);

            border-radius:24px;

            padding:30px 22px;

            text-align:center;

            box-shadow:
                0 25px 80px
                rgba(0,0,0,.65);

            animation:
                adminPopupIn
                .25s ease;
        }


        .admin-action-icon {

            width:72px;
            height:72px;

            margin:0 auto 18px;

            border-radius:50%;

            display:flex;
            align-items:center;
            justify-content:center;

            font-size:38px;
            font-weight:900;

            border:2px solid;
        }


        .admin-action-icon.success {

            color:#22c55e;

            border-color:#22c55e;

            background:
                rgba(34,197,94,.10);

            box-shadow:
                0 0 30px
                rgba(34,197,94,.18);
        }


        .admin-action-icon.error {

            color:#ef4444;

            border-color:#ef4444;

            background:
                rgba(239,68,68,.10);
        }


        .admin-action-icon.warning {

            color:#f59e0b;

            border-color:#f59e0b;

            background:
                rgba(245,158,11,.10);
        }


        .admin-action-box h2 {

            margin:0 0 10px;

            color:#f8fafc;

            font-size:25px;

            font-weight:800;
        }


        .admin-action-message {

            margin:0 0 22px;

            color:#94a3b8;

            font-size:14px;

            line-height:1.6;
        }


        .admin-action-details {

            display:grid;

            grid-template-columns:1fr 1fr;

            gap:10px;

            padding:15px;

            margin-bottom:20px;

            border-radius:14px;

            background:
                rgba(34,197,94,.07);

            border:1px solid
                rgba(34,197,94,.20);
        }


        .admin-action-details div {

            text-align:left;
        }


        .admin-action-details span {

            display:block;

            color:#64748b;

            font-size:11px;

            text-transform:uppercase;

            letter-spacing:.5px;

            margin-bottom:4px;
        }


        .admin-action-details strong {

            display:block;

            color:#22c55e;

            font-size:17px;
        }


        .admin-action-close {

            width:100%;

            border:none;

            border-radius:12px;

            padding:14px;

            background:
                linear-gradient(
                    135deg,
                    #22c55e,
                    #16a34a
                );

            color:white;

            font-size:15px;

            font-weight:800;

            cursor:pointer;
        }


        .admin-action-close:active {

            transform:scale(.98);
        }


        @keyframes adminPopupIn {

            from {

                opacity:0;

                transform:
                    translateY(15px)
                    scale(.96);
            }

            to {

                opacity:1;

                transform:
                    translateY(0)
                    scale(1);
            }
        }

    `;

    document.head.appendChild(style);
}

// =============================================================
// ESCAPE HTML
// =============================================================

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// =============================================================
// USER ID
// =============================================================

function createUserId() {

    let highest = 1001;

    Object.keys(appState.users)
        .forEach(function(id) {

            const match =
                String(id).match(/^AG(\d+)$/);

            if (match) {

                highest =
                    Math.max(
                        highest,
                        Number(match[1])
                    );
            }
        });

    return "AG" + (highest + 1);
}

// =============================================================
// PACKAGES
// =============================================================

function allowedPackage(amount) {

    return [
        999,
        1999,
        4999,
        9999
    ].includes(Number(amount));
}

// =============================================================
// PAGE RENDER
// =============================================================

function renderCurrentPage() {

    try {

        if (
            document.getElementById(
                "teamTableBody"
            )
        ) {

            if (
                typeof window.renderTeamPageData ===
                "function"
            ) {

                window.renderTeamPageData();
            }
        }

        if (
            document.getElementById(
                "historyTableBody"
            )
        ) {

            if (
                typeof window.renderHistoryPageData ===
                "function"
            ) {

                window.renderHistoryPageData();
            }
        }

        if (
            document.getElementById(
                "adminDepositList"
            ) ||
            document.getElementById(
                "adminWithdrawList"
            )
        ) {

            renderAdminData();
        }

    } catch (error) {

        console.error(
            "RENDER ERROR:",
            error
        );
    }
}

// =============================================================
// LOGIN
// =============================================================

window.handleUserLogin =
function(event) {

    if (event) {
        event.preventDefault();
    }

    const idElement =
        document.getElementById("loginUserId");

    const passwordElement =
        document.getElementById("loginPassword");

    if (!idElement || !passwordElement) {

        showToast(
            "Login form could not be loaded. Please refresh the page.",
            "error"
        );

        return false;
    }

    const userId =
        idElement.value
            .trim()
            .toUpperCase();

    const password =
        passwordElement.value.trim();

    const user =
        appState.users[userId];

    if (
        !user ||
        String(user.password) !== String(password)
    ) {

        showToast(
            "Invalid User ID or Password. Please check your details and try again.",
            "error"
        );

        return false;
    }

    if (
        user.status !== "ACTIVE" &&
        user.status !== "PACKAGE NOT ACTIVE"
    ) {

        showToast(
            "Your account is currently suspended. Please contact support.",
            "error"
        );

        return false;
    }

    appState.currentUser = userId;

    saveState();

    window.location.href =
        "dashboard.html";

    return false;
};

// =============================================================
// LOGOUT
// =============================================================

window.handleLogout =
function() {

    appState.currentUser = null;

    saveState();

    window.location.href =
        "index.html";
};

// =============================================================
// REGISTER
// =============================================================

window.handleUserRegister =
function(event) {

    if (event) {
        event.preventDefault();
    }

    const sponsorElement =
        document.getElementById("regSponsor");

    const nameElement =
        document.getElementById("regName");

    const mobileElement =
        document.getElementById("regMobile");

    const passwordElement =
        document.getElementById("regPassword");

    if (
        !sponsorElement ||
        !nameElement ||
        !mobileElement ||
        !passwordElement
    ) {

        alert(
            "❌ Registration form not found."
        );

        return false;
    }

    let sponsorId =
    sponsorElement.value.trim();

// Full referral URL ko User ID me convert karo
// Example:
// http://localhost:7700/register.html?ref=AG1010
//                ↓
// AG1010

try {

    if (
        sponsorId.includes("://") ||
        sponsorId.toLowerCase().includes("register.html?ref=")
    ) {

        const url = new URL(sponsorId);

        sponsorId =
            url.searchParams.get("ref") || "";
    }

} catch (error) {

    const marker = "register.html?ref=";

    const lowerSponsor =
        sponsorId.toLowerCase();

    const position =
        lowerSponsor.indexOf(marker);

    if (position !== -1) {

        sponsorId =
            sponsorId.substring(
                position + marker.length
            );

        sponsorId =
            sponsorId.split("&")[0];
    }
}

try {

    sponsorId =
        decodeURIComponent(sponsorId);

} catch (error) {
    // Ignore decode error
}

sponsorId =
    sponsorId.trim().toUpperCase();

    const name =
        nameElement.value.trim();

    const mobile =
        mobileElement.value.trim();

    const password =
        passwordElement.value.trim();

    // ---------------------------------------------------------
    // SPONSOR CHECK
    // ---------------------------------------------------------

    if (!appState.users[sponsorId]) {

        alert(
            "❌ Invalid Sponsor / Referral ID."
        );

        return false;
    }

    // ---------------------------------------------------------
    // NAME CHECK
    // ---------------------------------------------------------

    if (name.length < 2) {

        alert(
            "⚠️ Enter a valid name."
        );

        return false;
    }

    // ---------------------------------------------------------
    // MOBILE CHECK
    // ---------------------------------------------------------

    if (!/^[0-9]{10}$/.test(mobile)) {

        alert(
            "⚠️ Enter valid 10 digit mobile."
        );

        return false;
    }

    // ---------------------------------------------------------
    // PASSWORD CHECK
    // ---------------------------------------------------------

    if (password.length < 6) {

        alert(
            "⚠️ Password must be at least 6 characters."
        );

        return false;
    }

    // ---------------------------------------------------------
    // DUPLICATE MOBILE CHECK
    // ---------------------------------------------------------

    const mobileExists =
        Object.values(appState.users)
            .some(function(user) {

                return String(user.mobile) ===
                    String(mobile);

            });

    if (mobileExists) {

        alert(
            "❌ Mobile number already registered."
        );

        return false;
    }

    // ---------------------------------------------------------
    // CREATE USER ID
    // ---------------------------------------------------------

    const newUserId =
        createUserId();

    // ---------------------------------------------------------
    // CREATE NEW USER
    // ---------------------------------------------------------

    appState.users[newUserId] = {

        userId: newUserId,

        name: name,

        mobile: mobile,

        password: password,

        sponsorId: sponsorId,

        status: "PACKAGE NOT ACTIVE",

        // -----------------------------------------------------
        // MULTIPLE PACKAGES
        // -----------------------------------------------------

        packages: [],

        // -----------------------------------------------------
        // TOTAL PACKAGE VALUES
        // -----------------------------------------------------

        package: 0,

        roiDaily: 0,

        // -----------------------------------------------------
        // WALLET / EARNINGS
        // -----------------------------------------------------

        walletBal: 0,

        totalEarned: 0,

        roiEarned: 0,

        teamEarned: 0,

        referrals: 0,

        lastRoiDate: TODAY()
    };

    // ---------------------------------------------------------
    // UPDATE SPONSOR REFERRAL COUNT
    // ---------------------------------------------------------

    appState.users[sponsorId].referrals =
        Number(
            appState.users[sponsorId].referrals || 0
        ) + 1;

    // ---------------------------------------------------------
    // SAVE
    // ---------------------------------------------------------

    saveState();

    // ---------------------------------------------------------
    // SUCCESS POPUP
    // ---------------------------------------------------------

    showRegistrationSuccess(newUserId);

    return false;
};

// =============================================================
// PROFESSIONAL REGISTRATION SUCCESS POPUP
// =============================================================

function showRegistrationSuccess(memberId) {

    let popup =
        document.getElementById("registrationSuccessPopup");

    if (!popup) {

        popup = document.createElement("div");

        popup.id =
            "registrationSuccessPopup";

        popup.innerHTML = `
            <div class="registration-success-box">

                <div class="success-icon">
                    ✓
                </div>

                <h2>
                    Registration Successful
                </h2>

                <p class="success-subtitle">
                    Your Aarohan Global account has been created successfully.
                </p>

                <div class="member-id-box">

                    <span>YOUR MEMBER ID</span>

                    <strong id="successMemberId">
                        ${escapeHTML(memberId)}
                    </strong>

                </div>

                <p class="save-note">
                    Please save your Member ID for login.
                </p>

                <button
                    type="button"
                    onclick="closeRegistrationSuccess()"
                >
                    OK, Continue
                </button>

            </div>
        `;

        popup.style.cssText = `
            position:fixed;
            inset:0;
            background:rgba(2,6,23,.78);
            backdrop-filter:blur(8px);
            -webkit-backdrop-filter:blur(8px);
            display:flex;
            align-items:center;
            justify-content:center;
            padding:20px;
            z-index:999999;
        `;

        document.body.appendChild(popup);
    }

    const member =
        document.getElementById(
            "successMemberId"
        );

    if (member) {
        member.innerText = memberId;
    }

    popup.style.display = "flex";

    document.body.style.overflow = "hidden";
}


// =============================================================
// CLOSE REGISTRATION SUCCESS POPUP
// =============================================================

window.closeRegistrationSuccess =
function() {

    const popup =
        document.getElementById(
            "registrationSuccessPopup"
        );

    if (popup) {

        popup.style.display = "none";
    }

    document.body.style.overflow = "";

    window.location.href =
        "index.html";
};
// =============================================================
// PREMIUM REFERRAL COPY
// =============================================================

window.copyRefLink =
async function() {

    const input =
        document.getElementById("refLinkInput");

    if (!input) {
        return;
    }

    // Actual referral URL
    const referralURL =
        input.dataset.referralUrl;

    if (!referralURL) {

        showToast(
            "Referral link is not available.",
            "error"
        );

        return;
    }

    try {

        await navigator.clipboard.writeText(
            referralURL
        );

        showToast(
            "Referral link copied successfully!",
            "success"
        );

    } catch (error) {

        // Fallback for older browsers
        const temp =
            document.createElement("textarea");

        temp.value =
            referralURL;

        document.body.appendChild(temp);

        temp.select();

        document.execCommand("copy");

        temp.remove();

        showToast(
            "Referral link copied successfully!",
            "success"
        );
    }
};

// =============================================================
// DEPOSIT
// =============================================================

let currentSelectedPkgAmount = 999;

window.openDepositModal =
function(amount) {

    const numericAmount =
        Number(amount);

    if (!allowedPackage(numericAmount)) {

        alert(
            "❌ Invalid package."
        );

        return;
    }

    currentSelectedPkgAmount =
        numericAmount;

    const text =
        document.getElementById(
            "modalPkgAmount"
        );

    if (text) {

        text.innerText =
            "Package Amount: ₹" +
            money(numericAmount);
    }

    const modal =
        document.getElementById(
            "depositModal"
        );

    if (modal) {

        modal.style.display = "flex";
    }
};

// =============================================================
// CLOSE DEPOSIT
// =============================================================

window.closeDepositModal =
function() {

    const modal =
        document.getElementById(
            "depositModal"
        );

    if (modal) {

        modal.style.display = "none";
    }

    const input =
        document.getElementById(
            "modalUtrInput"
        );

    if (input) {

        input.value = "";
    }
};

// =============================================================
// TEST DEPOSIT
// =============================================================

window.submitDepositPayment =
function() {

    const user = getCurrentUser();

    if (!user) {

        showToast(
            "Please login first.",
            "warning"
        );

        window.location.href =
            "index.html";

        return;
    }

    const input =
        document.getElementById(
            "modalUtrInput"
        );

    const reference =
        input
            ? input.value.trim()
            : "";

// ---------------------------------------------------------
// UTR VALIDATION - EXACTLY 12 DIGITS
// ---------------------------------------------------------

if (!/^[0-9]{12}$/.test(reference)) {

    showToast(
        "Please enter a valid 12-digit UTR / Transaction ID.",
        "warning"
    );

    if (input) {
        input.focus();
        input.select();
    }

    return;
}

    // ---------------------------------------------------------
    // DUPLICATE UTR CHECK
    // ---------------------------------------------------------

    const duplicate =
        appState.deposits.some(
            function(deposit) {

                return String(deposit.utr) ===
                    String(reference);

            }
        );

    if (duplicate) {

        showToast(
            "This UTR / Transaction ID has already been used.",
            "error"
        );

        if (input) {
            input.focus();
        }

        return;
    }

    // ---------------------------------------------------------
    // CREATE DEPOSIT REQUEST
    // ---------------------------------------------------------

    appState.deposits.push({

        id:
            "DEP" + Date.now(),

        userId:
            user.userId,

        amount:
            currentSelectedPkgAmount,

        utr:
            reference,

        status:
            "PENDING",

        date:
            new Date().toLocaleString(),

        demo:
            true
    });

    // ---------------------------------------------------------
    // SAVE
    // ---------------------------------------------------------

    saveState();

    // ---------------------------------------------------------
    // CLOSE MODAL
    // ---------------------------------------------------------

    closeDepositModal();

    // ---------------------------------------------------------
    // SUCCESS MESSAGE
    // ---------------------------------------------------------

    showToast(
        "Deposit request submitted successfully. Admin approval is pending.",
        "success"
    );
};

// =============================================================
// WITHDRAWAL
// UPI REQUIRED
// PROFESSIONAL POPUP
// =============================================================

window.requestWithdrawal =
function() {

    const user = getCurrentUser();

    if (!user) {

        showWithdrawPopup(
            "Please login first.",
            "error"
        );

        return;
    }

    // ---------------------------------------------------------
    // UPI INPUT
    // ---------------------------------------------------------

    const upiElement =
        document.getElementById("withdrawUpi");

    const amountElement =
        document.getElementById("withdrawAmount");

    if (!amountElement) {
        return;
    }

    // ---------------------------------------------------------
    // CHECK SAVED UPI
    // ---------------------------------------------------------

    const enteredUpi =
        upiElement
            ? upiElement.value.trim()
            : "";

    const savedUpi =
        String(user.upiId || "").trim();

    // ---------------------------------------------------------
    // FIRST WITHDRAWAL - SAVE UPI
    // ---------------------------------------------------------

    if (!savedUpi) {

        if (!enteredUpi) {

            showWithdrawPopup(
                "Please enter your UPI ID before requesting a withdrawal.",
                "warning"
            );

            if (upiElement) {
                upiElement.focus();
            }

            return;
        }

        if (
            !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/
                .test(enteredUpi)
        ) {

            showWithdrawPopup(
                "Please enter a valid UPI ID, for example name@upi.",
                "warning"
            );

            if (upiElement) {
                upiElement.focus();
            }

            return;
        }

        // SAVE UPI ID

        user.upiId =
            enteredUpi;

    } else {

        // -----------------------------------------------------
        // EXISTING SAVED UPI
        // -----------------------------------------------------

        if (upiElement && !enteredUpi) {

            upiElement.value =
                savedUpi;
        }

        // -----------------------------------------------------
        // PREVENT UPI CHANGE
        // -----------------------------------------------------

        if (
            enteredUpi &&
            enteredUpi !== savedUpi
        ) {

            showWithdrawPopup(
                "Your UPI ID is already saved. Please contact support to change it.",
                "warning"
            );

            if (upiElement) {

                upiElement.value =
                    savedUpi;
            }

            return;
        }
    }

    // ---------------------------------------------------------
    // FINAL UPI
    // ---------------------------------------------------------

    const finalUpi =
        String(user.upiId || "").trim();

    // ---------------------------------------------------------
    // AMOUNT
    // ---------------------------------------------------------

    const amount =
        Number(amountElement.value);

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        showWithdrawPopup(
            "Please enter a valid withdrawal amount.",
            "warning"
        );

        amountElement.focus();

        return;
    }

    // ---------------------------------------------------------
    // MINIMUM WITHDRAWAL
    // ---------------------------------------------------------

    if (amount < 750) {

        showWithdrawPopup(
            "Minimum withdrawal amount is ₹750.",
            "warning"
        );

        amountElement.focus();

        return;
    }

    // ---------------------------------------------------------
    // WALLET CHECK
    // ---------------------------------------------------------

    if (
        amount >
        Number(user.walletBal || 0)
    ) {

        showWithdrawPopup(
            "Insufficient wallet balance for this withdrawal.",
            "error"
        );

        return;
    }

    // ---------------------------------------------------------
    // PENDING WITHDRAWAL CHECK
    // ---------------------------------------------------------

    const pending =
        appState.withdrawals.some(
            function(withdrawal) {

                return (
                    withdrawal.userId ===
                    user.userId &&
                    withdrawal.status ===
                    "PENDING"
                );

            }
        );

    if (pending) {

        showWithdrawPopup(
            "You already have a pending withdrawal request. Please wait for admin review.",
            "warning"
        );

        return;
    }

    // ---------------------------------------------------------
    // DEDUCT WALLET
    // ---------------------------------------------------------

    user.walletBal =
        Number(user.walletBal || 0) -
        amount;

    // ---------------------------------------------------------
    // CREATE WITHDRAWAL
    // ---------------------------------------------------------

    appState.withdrawals.push({

        id:
            "WTH" + Date.now(),

        userId:
            user.userId,

        amount:
            amount,

        upiId:
            finalUpi,

        status:
            "PENDING",

        date:
            new Date().toLocaleString(),

        demo:
            true
    });

    // ---------------------------------------------------------
    // SAVE
    // ---------------------------------------------------------

    saveState();

    // ---------------------------------------------------------
    // CLEAR AMOUNT
    // ---------------------------------------------------------

    amountElement.value = "";

    // ---------------------------------------------------------
    // KEEP SAVED UPI
    // ---------------------------------------------------------

    if (upiElement) {

        upiElement.value =
            user.upiId;

        upiElement.readOnly =
            true;
    }

    // ---------------------------------------------------------
    // SUCCESS POPUP
    // ---------------------------------------------------------

    showWithdrawPopup(
        "Your withdrawal request of ₹" +
        money(amount) +
        " has been submitted successfully. Admin review is pending.",
        "success"
    );
};



// =============================================================
// ADMIN - APPROVE DEPOSIT
// DIRECT REFERRAL BONUS 5%
// OWN ROI STARTS NEXT DAY
// =============================================================

window.approveDeposit =
function(depositId) {

    const deposit =
        appState.deposits.find(function(item) {

            return item.id === depositId;

        });

    if (!deposit) {

        alert("❌ Deposit not found.");

        return;
    }

    if (deposit.status !== "PENDING") {

        alert("⚠️ This deposit is already processed.");

        return;
    }

    const user =
        appState.users[deposit.userId];

    if (!user) {

        alert("❌ User not found.");

        return;
    }

    const amount =
        Number(deposit.amount);

    if (!allowedPackage(amount)) {

        alert("❌ Invalid package amount.");

        return;
    }

    // ---------------------------------------------------------
    // PACKAGES ARRAY
    // ---------------------------------------------------------

    if (!Array.isArray(user.packages)) {

        user.packages = [];
    }

    // ---------------------------------------------------------
    // CREATE PACKAGE
    // ---------------------------------------------------------

    const packageId =
        "PKG" + Date.now();

    user.packages.push({

        id: packageId,

        amount: amount,

        status: "ACTIVE",

        dailyROI:
            amount * 0.05,

        totalEarned: 0,

        maxCap:
            amount * 3,

        // IMPORTANT:
        // Approval day par ROI nahi milega
        lastRoiDate:
            TODAY(),

        activatedAt:
            new Date().toLocaleString()
    });

    // ---------------------------------------------------------
    // RECALCULATE ACTIVE PACKAGE
    // ---------------------------------------------------------

    user.package =
        user.packages
            .filter(function(pkg) {

                return pkg.status === "ACTIVE";

            })
            .reduce(function(total, pkg) {

                return total +
                    Number(pkg.amount || 0);

            }, 0);

    // ---------------------------------------------------------
    // DAILY ROI TOTAL
    // ---------------------------------------------------------

    user.roiDaily =
        user.packages
            .filter(function(pkg) {

                return pkg.status === "ACTIVE";

            })
            .reduce(function(total, pkg) {

                return total +
                    Number(pkg.dailyROI || 0);

            }, 0);

    // ---------------------------------------------------------
    // ACTIVATE USER
    // ---------------------------------------------------------

    user.status =
        "ACTIVE";

    user.lastRoiDate =
        TODAY();

    // ---------------------------------------------------------
    // APPROVE DEPOSIT
    // ---------------------------------------------------------

    deposit.status =
        "APPROVED";

    deposit.approvedAt =
        new Date().toLocaleString();

    // =========================================================
    // DIRECT REFERRAL BONUS - 5%
    // =========================================================

    const sponsorId =
        String(user.sponsorId || "")
            .trim()
            .toUpperCase();

    if (
        sponsorId &&
        appState.users[sponsorId] &&
        sponsorId !== "AG1001"
    ) {

        const sponsor =
            appState.users[sponsorId];

        const directBonus =
            amount * 0.05;

        sponsor.walletBal =
            Number(sponsor.walletBal || 0) +
            directBonus;

        sponsor.totalEarned =
            Number(sponsor.totalEarned || 0) +
            directBonus;

        sponsor.teamEarned =
            Number(sponsor.teamEarned || 0) +
            directBonus;

        // Commission history
        if (!Array.isArray(sponsor.commissionHistory)) {

            sponsor.commissionHistory = [];
        }

        sponsor.commissionHistory.push({

            id:
                "COM" + Date.now(),

            type:
                "DIRECT_BONUS",

            level:
                1,

            fromUser:
                user.userId,

            packageAmount:
                amount,

            amount:
                directBonus,

            date:
                new Date().toLocaleString()
        });
    }

    // ---------------------------------------------------------
    // SAVE
    // ---------------------------------------------------------

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(appState)
    );

    // ---------------------------------------------------------
    // REFRESH
    // ---------------------------------------------------------

    updateAdminSummary();

    renderAdminData();

    updateDashboard();

    // ---------------------------------------------------------
    // SUCCESS
    // ---------------------------------------------------------

    showToast(
        "Package approved • " +
        user.userId +
        " • ₹" +
        money(amount) +
        " • Own ROI starts tomorrow.",
        "success"
    );
};

// =============================================================
// ADMIN - REJECT DEPOSIT
// =============================================================

window.rejectDeposit =
function(depositId) {

    const deposit =
        appState.deposits.find(
            function(item) {

                return item.id === depositId;

            }
        );

    if (!deposit) {

        alert(
            "❌ Deposit not found."
        );

        return;
    }

    if (deposit.status !== "PENDING") {

        alert(
            "⚠️ This deposit is already processed."
        );

        return;
    }

    deposit.status = "REJECTED";

    deposit.rejectedAt =
        new Date().toLocaleString();

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(appState)
    );

    updateAdminSummary();

    renderAdminData();

showToast(
    "Deposit rejected • " +
    deposit.userId +
    " • ₹" +
    money(deposit.amount),
    "error"
);
};
// =============================================================
// ADMIN - APPROVE WITHDRAWAL
// PROFESSIONAL VERSION
// =============================================================

window.approveWithdrawal =
function(withdrawalId) {

    const withdrawal =
        appState.withdrawals.find(
            function(item) {

                return item.id ===
                    withdrawalId;
            }
        );

    if (
        !withdrawal ||
        withdrawal.status !== "PENDING"
    ) {

        showAdminActionPopup(
            "Request Not Available",
            "This withdrawal request has already been processed.",
            "warning"
        );

        return;
    }

    withdrawal.status =
        "APPROVED";

    withdrawal.approvedAt =
        new Date().toLocaleString();

    saveState();

    showAdminActionPopup(
        "Withdrawal Approved",
        "The withdrawal request has been approved successfully.",
        "success",
        {
            userId:
                withdrawal.userId,

            amount:
                withdrawal.amount
        }
    );
};

// =============================================================
// ADMIN - REJECT WITHDRAWAL
// =============================================================

window.rejectWithdrawal =
function(withdrawalId) {

    const withdrawal =
        appState.withdrawals.find(
            function(item) {

                return item.id ===
                    withdrawalId;

            }
        );

    if (
        !withdrawal ||
        withdrawal.status !== "PENDING"
    ) {
        return;
    }

    const user =
        appState.users[
            withdrawal.userId
        ];

    if (user) {

        user.walletBal =
            Number(user.walletBal || 0) +
            Number(withdrawal.amount || 0);
    }

    withdrawal.status = "REJECTED";

    withdrawal.rejectedAt =
        new Date().toLocaleString();

    saveState();

showAdminActionPopup(
    "Withdrawal Rejected",
    "The withdrawal request has been rejected and the amount has been returned to the user's wallet.",
    "error",
    {
        userId:
            withdrawal.userId,

        amount:
            withdrawal.amount
    }
);
};

// =============================================================
// ADMIN - TEST WALLET CREDIT
// DEMO / TEST ONLY
// =============================================================

window.adminCreditWallet =
function() {

    const admin =
        getCurrentUser();

    // ---------------------------------------------------------
    // ADMIN CHECK
    // ---------------------------------------------------------

    if (
        !admin ||
        admin.userId !== "AG1001"
    ) {

        showToast(
            "Admin access required.",
            "error"
        );

        return;
    }

    // ---------------------------------------------------------
    // INPUTS
    // ---------------------------------------------------------

    const userIdElement =
        document.getElementById(
            "adminCreditUserId"
        );

    const amountElement =
        document.getElementById(
            "adminCreditAmount"
        );

    if (
        !userIdElement ||
        !amountElement
    ) {
        return;
    }

    const userId =
        userIdElement.value
            .trim()
            .toUpperCase();

    const amount =
        Number(
            amountElement.value
        );

    // ---------------------------------------------------------
    // USER ID CHECK
    // ---------------------------------------------------------

    if (!userId) {

        showToast(
            "Please enter User ID.",
            "warning"
        );

        userIdElement.focus();

        return;
    }

    // ---------------------------------------------------------
    // USER EXISTENCE
    // ---------------------------------------------------------

    const user =
        appState.users[userId];

    if (!user) {

        showToast(
            "User ID not found.",
            "error"
        );

        userIdElement.focus();

        return;
    }

    // ---------------------------------------------------------
    // AMOUNT CHECK
    // ---------------------------------------------------------

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        showToast(
            "Please enter a valid amount.",
            "warning"
        );

        amountElement.focus();

        return;
    }

    // ---------------------------------------------------------
    // CREDIT WALLET
    // ---------------------------------------------------------

    user.walletBal =
        Number(user.walletBal || 0) +
        amount;

    // ---------------------------------------------------------
    // SAVE
    // ---------------------------------------------------------

    saveState();

    // ---------------------------------------------------------
    // CLEAR INPUTS
    // ---------------------------------------------------------

    userIdElement.value = "";
    amountElement.value = "";

    // ---------------------------------------------------------
    // SUCCESS
    // ---------------------------------------------------------

    showToast(
        "₹" +
        money(amount) +
        " test balance added to " +
        user.userId +
        ".",
        "success"
    );
};
// =============================================================
// ADMIN SUMMARY
// =============================================================

function updateAdminSummary() {

    const approvedDeposits =
        appState.deposits.filter(
            function(deposit) {

                return deposit.status ===
                    "APPROVED";

            }
        );

    const pendingDeposits =
        appState.deposits.filter(
            function(deposit) {

                return deposit.status ===
                    "PENDING";

            }
        );

    const approvedTotal =
        approvedDeposits.reduce(
            function(total, deposit) {

                return total +
                    Number(
                        deposit.amount || 0
                    );

            },
            0
        );

    const approvedElement =
        document.getElementById(
            "totalApprovedDeposits"
        );

    if (approvedElement) {

        approvedElement.innerText =
            "₹" + money(approvedTotal);
    }

    const pendingElement =
        document.getElementById(
            "pendingDepositCount"
        );

    if (pendingElement) {

        pendingElement.innerText =
            pendingDeposits.length;
    }
}
// =============================================================
// ADMIN DATA
// =============================================================

function renderAdminData() {

    updateAdminSummary();

    // ---------------------------------------------------------
    // DEPOSITS
    // ---------------------------------------------------------

    const depositList =
        document.getElementById(
            "adminDepositList"
        );

    if (depositList) {

        const deposits =
            appState.deposits.filter(
                function(deposit) {

                    return deposit.status ===
                        "PENDING";

                }
            );

        if (deposits.length === 0) {

            depositList.innerHTML =
                "<p style='color:#64748b;font-size:13px;'>No pending deposits.</p>";

        } else {

            depositList.innerHTML =
                deposits.map(
                    function(deposit) {

                        return `
<div style="
background:#0f172a;
padding:12px;
border-radius:8px;
margin-bottom:8px;
">

<b>
${escapeHTML(deposit.userId)}
</b>

-
₹${money(deposit.amount)}

<br>

<small style="color:#94a3b8;">
Test Ref:
${escapeHTML(deposit.utr)}
</small>

<br>

<small style="color:#64748b;">
${escapeHTML(deposit.date)}
</small>

<div style="
display:flex;
gap:8px;
margin-top:10px;
">

<button
onclick="approveDeposit('${deposit.id}')"
style="
background:#22c55e;
color:white;
border:none;
padding:8px 12px;
border-radius:6px;
font-weight:bold;
">

Approve

</button>

<button
onclick="rejectDeposit('${deposit.id}')"
style="
background:#ef4444;
color:white;
border:none;
padding:8px 12px;
border-radius:6px;
font-weight:bold;
">

Reject

</button>

</div>

</div>
`;

                    }
                ).join("");
        }
    }
// ---------------------------------------------------------
// WITHDRAWALS
// ---------------------------------------------------------

const withdrawalList =
    document.getElementById(
        "adminWithdrawList"
    );

if (withdrawalList) {

    const withdrawals =
        appState.withdrawals.filter(
            function(withdrawal) {

                return withdrawal.status ===
                    "PENDING";

            }
        );

    if (withdrawals.length === 0) {

        withdrawalList.innerHTML =
            "<p style='color:#64748b;font-size:13px;'>No pending withdrawals.</p>";

    } else {

        withdrawalList.innerHTML =
            withdrawals.map(
                function(withdrawal) {

                    const withdrawalUser =
                        appState.users[withdrawal.userId];

                    const displayUpi =
                        withdrawal.upiId ||
                        (withdrawalUser
                            ? withdrawalUser.upiId
                            : "") ||
                        "Not provided";

                    return `
<div style="
background:#0f172a;
padding:12px;
border-radius:8px;
margin-bottom:8px;
">

<b>
${escapeHTML(withdrawal.userId)}
</b>

-
₹${money(withdrawal.amount)}

<br>

<small style="
color:#38bdf8;
font-size:13px;
font-weight:bold;
display:block;
margin-top:6px;
">
UPI ID:
${escapeHTML(displayUpi)}
</small>

<br>

<small style="color:#94a3b8;">
${escapeHTML(withdrawal.date)}
</small>

<div style="
display:flex;
gap:8px;
margin-top:10px;
">

<button
onclick="approveWithdrawal('${withdrawal.id}')"
style="
background:#22c55e;
color:white;
border:none;
padding:8px 10px;
border-radius:5px;
font-weight:bold;
">

Approve

</button>

<button
onclick="rejectWithdrawal('${withdrawal.id}')"
style="
background:#ef4444;
color:white;
border:none;
padding:8px 10px;
border-radius:5px;
font-weight:bold;
">

Reject

</button>

</div>

</div>
`;

                }
            ).join("");
    }
}
}
// =============================================================
// DASHBOARD
// =============================================================

function updateDashboard() {

    const user = getCurrentUser();

    if (!user) {
        return;
    }

    function setText(id, value) {

        const element =
            document.getElementById(id);

        if (element) {
            element.innerText = value;
        }
    }

    setText(
        "userName",
        user.name || "User"
    );

    setText(
        "userBadge",
        user.userId +
        " (" +
        (user.status || "ACTIVE") +
        ")"
    );

    setText(
        "mainWallet",
        "₹" + money(user.walletBal)
    );

    setText(
        "totalEarned",
        "₹" + money(user.totalEarned)
    );

    setText(
        "activePkg",
        "₹" + money(user.package)
    );

    setText(
        "dailyRoi",
        "₹" +
        money(user.roiDaily) +
        "/day"
    );
    
    renderDashboardDirectReferrals();
// ---------------------------------------------------------
// REFERRAL LINK
// ---------------------------------------------------------

const refInput =
    document.getElementById("refLinkInput");

const refCode =
    document.getElementById("referralCode");

if (refInput || refCode) {

    const currentPath =
        window.location.pathname;

    const folder =
        currentPath.substring(
            0,
            currentPath.lastIndexOf("/")
        );

    const referralURL =
        window.location.origin +
        folder +
        "/register.html?ref=" +
        encodeURIComponent(user.userId);

    if (refCode) {
        refCode.innerText =
            user.userId;
    }

    if (refInput) {
        refInput.value =
            referralURL;

        refInput.dataset.referralUrl =
            referralURL;
    }
}
// ---------------------------------------------------------
    // 3X CAP
    // ---------------------------------------------------------

    const packageAmount =
        Number(user.package || 0);

    const earned =
        Number(user.totalEarned || 0);

    const maxCap =
        packageAmount * 3;

    const percentage =
        maxCap > 0
            ? Math.min(
                100,
                (earned / maxCap) * 100
            )
            : 0;

    setText(
        "cappingText",
        "₹" +
        money(earned) +
        " / ₹" +
        money(maxCap) +
        " (" +
        percentage.toFixed(1) +
        "%)"
    );

    const bar =
        document.getElementById(
            "cappingBar"
        );

    if (bar) {

        bar.style.width =
            percentage + "%";
    }


        // ---------------------------------------------------------
    // WITHDRAWAL HISTORY
    // ---------------------------------------------------------

    const history =
        document.getElementById(
            "withdrawalHistoryBody"
        );

    if (history) {

        const withdrawals =
            appState.withdrawals.filter(
                function(item) {

                    return item.userId ===
                        user.userId;

                }
            );

        if (withdrawals.length === 0) {

            history.innerHTML = `
<tr>
<td
colspan="3"
style="
text-align:center;
color:#64748b;
"
>
No withdrawal history.
</td>
</tr>
`;

        } else {

            history.innerHTML =
                withdrawals.map(
                    function(item) {

                        return `
<tr>

<td>
${escapeHTML(item.date)}
</td>

<td>
₹${money(item.amount)}
</td>

<td>
${escapeHTML(item.status)}
</td>

</tr>
`;

                    }
                ).join("");
        }
    }

    // ---------------------------------------------------------
    // ADMIN PANEL
    // ---------------------------------------------------------

    const adminPanel =
        document.getElementById(
            "adminPanel"
        );

    if (adminPanel) {

        if (user.userId === "AG1001") {

            adminPanel.style.display =
                "block";

            renderAdminData();

        } else {

            adminPanel.style.display =
                "none";
        }
    }
}
// =============================================================
// DASHBOARD - DIRECT REFERRALS
// =============================================================

function renderDashboardDirectReferrals() {

    const user = getCurrentUser();

    if (!user) {
        return;
    }

    const directMembers =
        Object.values(appState.users)
            .filter(function(member) {

                return String(member.sponsorId || "")
                    .toUpperCase() ===
                    String(user.userId || "")
                    .toUpperCase();

            });

    // DIRECT COUNT
    const countElement =
        document.getElementById("directTeamCount");

    if (countElement) {
        countElement.innerText =
            directMembers.length;
    }

    // DIRECT REFERRAL TABLE
    const table =
        document.getElementById(
            "directTeamTableBody"
        );

    if (!table) {
        return;
    }

    if (directMembers.length === 0) {

        table.innerHTML = `
<tr>
    <td
        colspan="5"
        style="
            text-align:center;
            color:#64748b;
            padding:15px;
        "
    >
        No direct referrals yet.
    </td>
</tr>
`;

        return;
    }

    table.innerHTML =
        directMembers.map(function(member) {

            return `
<tr>

    <td>
        ${escapeHTML(member.userId)}
    </td>

    <td>
        ${escapeHTML(member.name)}
    </td>

    <td>
        ${escapeHTML(member.mobile)}
    </td>

    <td>
        ₹${money(member.package || 0)}
    </td>

    <td>
        ${escapeHTML(member.status || "ACTIVE")}
    </td>

</tr>
`;

        }).join("");
}

// =============================================================
// TEAM PAGE
// =============================================================

window.renderTeamPageData =
function() {

    const user = getCurrentUser();

    if (!user) {
        return;
    }

    const team =
        Object.values(appState.users)
            .filter(function(member) {

                return member.sponsorId ===
                    user.userId;

            });

    const total =
        document.getElementById(
            "totalTeamCount"
        );

    if (total) {

        total.innerText =
            team.length +
            " Members";
    }

    const direct =
        document.getElementById(
            "directTeamCount"
        );

    if (direct) {

        direct.innerText =
            team.length;
    }

    const table =
        document.getElementById(
            "teamTableBody"
        );

    if (!table) {
        return;
    }

    if (team.length === 0) {

        table.innerHTML = `
<tr>
<td
colspan="4"
style="
text-align:center;
color:#64748b;
"
>
No team members yet.
</td>
</tr>
`;

        return;
    }

    table.innerHTML =
        team.map(
            function(member) {

                return `
<tr>

<td>
${escapeHTML(member.userId)}
</td>

<td>
${escapeHTML(member.name)}
</td>

<td>
₹${money(member.package)}
</td>

<td>
${escapeHTML(member.status)}
</td>

</tr>
`;

            }
        ).join("");
};
// =============================================================
// HISTORY PAGE
// =============================================================

window.renderHistoryPageData =
function() {

    const user = getCurrentUser();

    const table =
        document.getElementById(
            "historyTableBody"
        );

    if (!table || !user) {
        return;
    }

    const transactions = [];

    appState.deposits
        .filter(function(item) {

            return item.userId ===
                user.userId;

        })
        .forEach(function(item) {

            transactions.push({

                date: item.date,

                type: "Deposit",

                amount: item.amount,

                status: item.status
            });

        });

    appState.withdrawals
        .filter(function(item) {

            return item.userId ===
                user.userId;

        })
        .forEach(function(item) {

            transactions.push({

                date: item.date,

                type: "Withdrawal",

                amount: item.amount,

                status: item.status
            });

        });

    if (transactions.length === 0) {

        table.innerHTML = `
<tr>
<td
colspan="4"
style="
text-align:center;
color:#64748b;
"
>
No transactions found.
</td>
</tr>
`;

        return;
    }

    table.innerHTML =
        transactions.map(
            function(item) {

                return `
<tr>

<td>
${escapeHTML(item.date)}
</td>

<td>
${escapeHTML(item.type)}
</td>

<td>
₹${money(item.amount)}
</td>

<td>
${escapeHTML(item.status)}
</td>

</tr>
`;

            }
        ).join("");
};

// =============================================================
// AUTO REFERRAL - FIXED
// =============================================================

function loadReferralFromURL() {

    const sponsorInput =
        document.getElementById("regSponsor");

    if (!sponsorInput) {
        return;
    }

    const params =
        new URLSearchParams(
            window.location.search
        );

    let ref =
        params.get("ref") || "";

    // ---------------------------------------------------------
    // CLEAN REFERRAL ID
    // ---------------------------------------------------------

    ref = ref.trim();

    try {
        ref = decodeURIComponent(ref);
    } catch (error) {
        // Ignore decode error
    }

    // ---------------------------------------------------------
    // UPPERCASE
    // ---------------------------------------------------------

    ref =
        ref.trim().toUpperCase();

    // ---------------------------------------------------------
    // CHECK USER ID
    // ---------------------------------------------------------

    if (
        ref &&
        appState.users[ref]
    ) {

        sponsorInput.value =
            ref;

        sponsorInput.readOnly =
            true;

        sponsorInput.style.color =
            "#38bdf8";

        sponsorInput.style.fontWeight =
            "700";

    } else {

        sponsorInput.value = "";

        sponsorInput.readOnly = false;
    }
}

// =============================================================
// DAILY ROI + 3 LEVEL TEAM COMMISSION
// DEMO / TEST VERSION
//
// OWN ROI:
// 5% DAILY
//
// TEAM COMMISSION:
// LEVEL 1 = 10% OF DOWNLINE DAILY ROI
// LEVEL 2 = 5%  OF DOWNLINE DAILY ROI
// LEVEL 3 = 3%  OF DOWNLINE DAILY ROI
//
// ROI STARTS FROM NEXT DAY AFTER APPROVAL
// =============================================================

function processDailyROI() {

    const today = TODAY();

    // ---------------------------------------------------------
    // Store today's own ROI
    // ---------------------------------------------------------

    const todaysROI = {};

    // =========================================================
    // STEP 1
    // CALCULATE OWN ROI
    // =========================================================

    Object.values(appState.users).forEach(function(user) {

        // Admin ko ROI nahi
        if (user.userId === "AG1001") {
            return;
        }

        // Packages nahi
        if (!Array.isArray(user.packages)) {
            return;
        }

        let totalTodayROI = 0;

        user.packages.forEach(function(pkg) {

            // ACTIVE package only
            if (pkg.status !== "ACTIVE") {
                return;
            }

            const amount =
                Number(pkg.amount || 0);

            const dailyROI =
                Number(pkg.dailyROI || 0);

            const maxCap =
                Number(
                    pkg.maxCap ||
                    (amount * 3)
                );

            const packageEarned =
                Number(
                    pkg.totalEarned || 0
                );

            // -------------------------------------------------
            // 3X COMPLETE
            // -------------------------------------------------

            if (packageEarned >= maxCap) {

                pkg.totalEarned =
                    maxCap;

                pkg.status =
                    "COMPLETED";

                return;
            }

            // -------------------------------------------------
            // APPROVAL DAY / ALREADY PROCESSED
            // -------------------------------------------------

            if (pkg.lastRoiDate === today) {

                return;
            }

            // -------------------------------------------------
            // REMAINING CAP
            // -------------------------------------------------

            const remaining =
                maxCap -
                packageEarned;

            const roiToCredit =
                Math.min(
                    dailyROI,
                    remaining
                );

            if (roiToCredit <= 0) {

                pkg.status =
                    "COMPLETED";

                return;
            }

            // -------------------------------------------------
            // ADD OWN ROI
            // -------------------------------------------------

            pkg.totalEarned =
                packageEarned +
                roiToCredit;

            pkg.lastRoiDate =
                today;

            totalTodayROI +=
                roiToCredit;

            // -------------------------------------------------
            // PACKAGE COMPLETE
            // -------------------------------------------------

            if (
                pkg.totalEarned >=
                maxCap
            ) {

                pkg.totalEarned =
                    maxCap;

                pkg.status =
                    "COMPLETED";
            }

        });

        // -----------------------------------------------------
        // SAVE TODAY'S ROI FOR TEAM COMMISSION
        // -----------------------------------------------------

        todaysROI[user.userId] =
            totalTodayROI;

        // -----------------------------------------------------
        // USER WALLET
        // -----------------------------------------------------

        if (totalTodayROI > 0) {

            user.walletBal =
                Number(user.walletBal || 0) +
                totalTodayROI;

            user.totalEarned =
                Number(user.totalEarned || 0) +
                totalTodayROI;

            user.roiEarned =
                Number(user.roiEarned || 0) +
                totalTodayROI;
        }

        // -----------------------------------------------------
        // ACTIVE PACKAGE TOTAL
        // -----------------------------------------------------

        user.package =
            user.packages
                .filter(function(pkg) {

                    return pkg.status === "ACTIVE";

                })
                .reduce(function(total, pkg) {

                    return total +
                        Number(pkg.amount || 0);

                }, 0);

        // -----------------------------------------------------
        // DAILY ROI TOTAL
        // -----------------------------------------------------

        user.roiDaily =
            user.packages
                .filter(function(pkg) {

                    return pkg.status === "ACTIVE";

                })
                .reduce(function(total, pkg) {

                    return total +
                        Number(pkg.dailyROI || 0);

                }, 0);

        // -----------------------------------------------------
        // USER STATUS
        // -----------------------------------------------------

        const hasActivePackage =
            user.packages.some(function(pkg) {

                return pkg.status === "ACTIVE";

            });

        user.status =
            hasActivePackage
                ? "ACTIVE"
                : "PACKAGE NOT ACTIVE";
    });


    // =========================================================
    // STEP 2
    // 3 LEVEL TEAM COMMISSION
    // =========================================================

    Object.values(appState.users).forEach(function(user) {

        // Admin ko team commission nahi
        if (user.userId === "AG1001") {
            return;
        }

        // User ki aaj ki ROI
        const downlineROI =
            Number(
                todaysROI[user.userId] || 0
            );

        // Agar aaj ROI nahi mila
        if (downlineROI <= 0) {
            return;
        }

        // -----------------------------------------------------
        // FIND LEVEL 1
        // -----------------------------------------------------

        let currentSponsorId =
            String(user.sponsorId || "")
                .trim()
                .toUpperCase();

        // -----------------------------------------------------
        // LEVEL 1 / 2 / 3
        // -----------------------------------------------------

        const commissionRates = {

            1: 0.10,

            2: 0.05,

            3: 0.03
        };

        for (
            let level = 1;
            level <= 3;
            level++
        ) {

            if (!currentSponsorId) {
                break;
            }

            const sponsor =
                appState.users[
                    currentSponsorId
                ];

            if (!sponsor) {
                break;
            }

            // Admin ko commission nahi
            if (
                sponsor.userId !== "AG1001"
            ) {

                const rate =
                    commissionRates[level];

                const commission =
                    downlineROI *
                    rate;

                if (commission > 0) {

                    // -------------------------------------------------
                    // WALLET
                    // -------------------------------------------------

                    sponsor.walletBal =
                        Number(
                            sponsor.walletBal || 0
                        ) +
                        commission;

                    // -------------------------------------------------
                    // TOTAL EARNED
                    // -------------------------------------------------

                    sponsor.totalEarned =
                        Number(
                            sponsor.totalEarned || 0
                        ) +
                        commission;

                    // -------------------------------------------------
                    // TEAM EARNED
                    // -------------------------------------------------

                    sponsor.teamEarned =
                        Number(
                            sponsor.teamEarned || 0
                        ) +
                        commission;

                    // -------------------------------------------------
                    // COMMISSION HISTORY
                    // -------------------------------------------------

                    if (
                        !Array.isArray(
                            sponsor.commissionHistory
                        )
                    ) {

                        sponsor.commissionHistory = [];
                    }

                    sponsor.commissionHistory.push({

                        id:
                            "COM" +
                            Date.now() +
                            "_" +
                            level +
                            "_" +
                            Math.random()
                                .toString(36)
                                .substring(2, 7),

                        type:
                            "TEAM_ROI",

                        level:
                            level,

                        fromUser:
                            user.userId,

                        downlineROI:
                            downlineROI,

                        rate:
                            rate * 100,

                        amount:
                            commission,

                        date:
                            today
                    });
                }
            }

            // -----------------------------------------------------
            // NEXT UPLINE
            // -----------------------------------------------------

            currentSponsorId =
                String(
                    sponsor.sponsorId || ""
                )
                .trim()
                .toUpperCase();
        }
    });


    // =========================================================
    // SAVE
    // =========================================================

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(appState)
    );
}
// =============================================================
// INITIALIZE
// =============================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        try {

            ensureAdminExists();

            loadReferralFromURL();

            processDailyROI();

            updateDashboard();

            updateAdminSummary();

            renderCurrentPage();
initializeAdminUserManagement();

initializeTransactionLedger();

        } catch (error) {

            console.error(
                "INITIALIZATION ERROR:",
                error
            );
        }
    }
);
// =============================================================
// ADMIN - USER MANAGEMENT
// =============================================================

window.renderAdminUsers =
function() {

    const currentUser =
        getCurrentUser();

    // ---------------------------------------------------------
    // ADMIN SECURITY CHECK
    // ---------------------------------------------------------

    if (
        !currentUser ||
        currentUser.userId !== "AG1001"
    ) {
        return;
    }

    const table =
        document.getElementById(
            "adminUserTableBody"
        );

    if (!table) {
        return;
    }

    const searchElement =
        document.getElementById(
            "adminUserSearch"
        );

    const search =
        searchElement
            ? searchElement.value
                .trim()
                .toLowerCase()
            : "";

    const users =
        Object.values(appState.users);

    // ---------------------------------------------------------
    // SUMMARY
    // ---------------------------------------------------------

    const totalUsers =
        users.filter(function(user) {

            return user.userId !== "AG1001";

        }).length;

    const activeUsers =
        users.filter(function(user) {

            return (
                user.userId !== "AG1001" &&
                user.status === "ACTIVE"
            );

        }).length;

    const totalElement =
        document.getElementById(
            "adminTotalUsers"
        );

    const activeElement =
        document.getElementById(
            "adminActiveUsers"
        );

    if (totalElement) {
        totalElement.innerText =
            totalUsers;
    }

    if (activeElement) {
        activeElement.innerText =
            activeUsers;
    }

    // ---------------------------------------------------------
    // SEARCH
    // ---------------------------------------------------------

    const filteredUsers =
        users.filter(function(user) {

            // Master Admin ko list me nahi dikhayenge
            if (
                user.userId === "AG1001"
            ) {
                return false;
            }

            if (!search) {
                return true;
            }

            return (
                String(user.userId || "")
                    .toLowerCase()
                    .includes(search) ||

                String(user.name || "")
                    .toLowerCase()
                    .includes(search) ||

                String(user.mobile || "")
                    .toLowerCase()
                    .includes(search)
            );
        });

    // ---------------------------------------------------------
    // NO USERS
    // ---------------------------------------------------------

    if (filteredUsers.length === 0) {

        table.innerHTML = `
            <tr>
                <td
                    colspan="7"
                    style="
                        text-align:center;
                        color:#64748b;
                        padding:20px;
                    "
                >
                    No users found.
                </td>
            </tr>
        `;

        return;
    }

    // ---------------------------------------------------------
    // USER TABLE
    // ---------------------------------------------------------

    table.innerHTML =
        filteredUsers.map(function(user) {

            const isActive =
                user.status === "ACTIVE";

            const statusColor =
                isActive
                    ? "#22c55e"
                    : "#f59e0b";

            const buttonColor =
                isActive
                    ? "#ef4444"
                    : "#22c55e";

            const buttonText =
                isActive
                    ? "Suspend"
                    : "Activate";

            return `

                <tr>

                    <td>
                        <b>
                            ${escapeHTML(user.userId)}
                        </b>
                    </td>

                    <td>
                        ${escapeHTML(user.name)}
                    </td>

                    <td>
                        ${escapeHTML(user.mobile)}
                    </td>

                    <td>
                        ₹${money(user.package || 0)}
                    </td>

                    <td>
                        ₹${money(user.walletBal || 0)}
                    </td>

                    <td>

                        <span
                            style="
                                color:${statusColor};
                                font-weight:bold;
                            "
                        >
                            ${escapeHTML(
                                user.status || "UNKNOWN"
                            )}
                        </span>

                    </td>

                    <td>

                        <button
                            type="button"
                            onclick="adminToggleUserStatus('${escapeHTML(user.userId)}')"
                            style="
                                background:${buttonColor};
                                color:white;
                                border:none;
                                border-radius:7px;
                                padding:7px 10px;
                                font-size:11px;
                                font-weight:bold;
                            "
                        >
                            ${buttonText}
                        </button>

                    </td>

                </tr>

            `;

        }).join("");
};


// =============================================================
// ADMIN - ACTIVATE / SUSPEND USER
// =============================================================

window.adminToggleUserStatus =
function(userId) {

    const admin =
        getCurrentUser();

    // ---------------------------------------------------------
    // ADMIN CHECK
    // ---------------------------------------------------------

    if (
        !admin ||
        admin.userId !== "AG1001"
    ) {

        showToast(
            "Admin access required.",
            "error"
        );

        return;
    }

    // ---------------------------------------------------------
    // PREVENT ADMIN SUSPENSION
    // ---------------------------------------------------------

    if (userId === "AG1001") {

        showToast(
            "Master Admin cannot be suspended.",
            "error"
        );

        return;
    }

    // ---------------------------------------------------------
    // FIND USER
    // ---------------------------------------------------------

    const user =
        appState.users[userId];

    if (!user) {

        showToast(
            "User not found.",
            "error"
        );

        return;
    }

    // ---------------------------------------------------------
    // CHANGE STATUS
    // ---------------------------------------------------------

    if (user.status === "ACTIVE") {

        user.status =
            "SUSPENDED";

        saveState();

        showAdminActionPopup(
            "User Suspended",
            "The member account has been suspended successfully.",
            "warning",
            {
                userId:
                    user.userId
            }
        );

    } else {

        user.status =
            user.package > 0
                ? "ACTIVE"
                : "PACKAGE NOT ACTIVE";

        saveState();

        showAdminActionPopup(
            "User Activated",
            "The member account has been activated successfully.",
            "success",
            {
                userId:
                    user.userId
            }
        );
    }

    // ---------------------------------------------------------
    // REFRESH USER LIST
    // ---------------------------------------------------------

    renderAdminUsers();
};


// =============================================================
// ADMIN USER MANAGEMENT INITIAL LOAD
// =============================================================

function initializeAdminUserManagement() {

    const admin =
        getCurrentUser();

    if (
        !admin ||
        admin.userId !== "AG1001"
    ) {
        return;
    }

    if (
        document.getElementById(
            "adminUserTableBody"
        )
    ) {

        renderAdminUsers();
    }
}

// =============================================================
// ADMIN - TRANSACTION LEDGER
// =============================================================

function getTransactionLedgerData() {

    const transactions = [];

    // ---------------------------------------------------------
    // DEPOSITS
    // ---------------------------------------------------------

    appState.deposits.forEach(function(deposit) {

        transactions.push({

            date:
                deposit.approvedAt ||
                deposit.rejectedAt ||
                deposit.date ||
                "",

            userId:
                deposit.userId,

            type:
                "DEPOSIT",

            amount:
                Number(deposit.amount || 0),

            status:
                deposit.status || "PENDING",

            details:
                "UTR: " +
                String(deposit.utr || "")

        });

    });


    // ---------------------------------------------------------
    // WITHDRAWALS
    // ---------------------------------------------------------

    appState.withdrawals.forEach(function(withdrawal) {

        transactions.push({

            date:
                withdrawal.approvedAt ||
                withdrawal.rejectedAt ||
                withdrawal.date ||
                "",

            userId:
                withdrawal.userId,

            type:
                "WITHDRAWAL",

            amount:
                Number(withdrawal.amount || 0),

            status:
                withdrawal.status || "PENDING",

            details:
                "UPI: " +
                String(withdrawal.upiId || "")

        });

    });


    // ---------------------------------------------------------
    // COMMISSION HISTORY
    // ---------------------------------------------------------

    Object.values(appState.users).forEach(function(user) {

        if (
            !Array.isArray(
                user.commissionHistory
            )
        ) {
            return;
        }

        user.commissionHistory.forEach(function(item) {

            let type =
                item.type || "TEAM_ROI";

            let details = "";

            if (type === "DIRECT_BONUS") {

                details =
                    "Direct Bonus from " +
                    String(item.fromUser || "");

            } else {

                details =
                    "Level " +
                    String(item.level || "") +
                    " commission from " +
                    String(item.fromUser || "");
            }

            transactions.push({

                date:
                    item.date || "",

                userId:
                    user.userId,

                type:
                    type,

                amount:
                    Number(item.amount || 0),

                status:
                    "CREDITED",

                details:
                    details

            });

        });

    });


    // ---------------------------------------------------------
    // SORT - NEWEST FIRST
    // ---------------------------------------------------------

    transactions.sort(function(a, b) {

        const dateA =
            new Date(a.date).getTime();

        const dateB =
            new Date(b.date).getTime();

        return (
            (Number.isFinite(dateB)
                ? dateB
                : 0) -
            (Number.isFinite(dateA)
                ? dateA
                : 0)
        );

    });


    return transactions;
}


// =============================================================
// RENDER TRANSACTION LEDGER
// =============================================================

window.renderTransactionLedger =
function() {

    const table =
        document.getElementById(
            "transactionLedgerBody"
        );

    if (!table) {
        return;
    }


    const searchElement =
        document.getElementById(
            "ledgerSearch"
        );

    const filterElement =
        document.getElementById(
            "ledgerTypeFilter"
        );


    const search =
        searchElement
            ? searchElement.value
                .trim()
                .toLowerCase()
            : "";


    const typeFilter =
        filterElement
            ? filterElement.value
            : "ALL";


    let transactions =
        getTransactionLedgerData();


    // ---------------------------------------------------------
    // SEARCH FILTER
    // ---------------------------------------------------------

    if (search) {

        transactions =
            transactions.filter(function(item) {

                return (

                    String(item.userId || "")
                        .toLowerCase()
                        .includes(search)

                    ||

                    String(item.type || "")
                        .toLowerCase()
                        .includes(search)

                    ||

                    String(item.status || "")
                        .toLowerCase()
                        .includes(search)

                    ||

                    String(item.details || "")
                        .toLowerCase()
                        .includes(search)

                );

            });

    }


    // ---------------------------------------------------------
    // TYPE FILTER
    // ---------------------------------------------------------

    if (typeFilter !== "ALL") {

        transactions =
            transactions.filter(function(item) {

                return item.type ===
                    typeFilter;

            });

    }


    // ---------------------------------------------------------
    // NO TRANSACTIONS
    // ---------------------------------------------------------

    if (transactions.length === 0) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    style="
                        text-align:center;
                        color:#64748b;
                        padding:20px;
                    "
                >
                    No transactions found.
                </td>

            </tr>

        `;

        return;
    }


    // ---------------------------------------------------------
    // TRANSACTION TABLE
    // ---------------------------------------------------------

    table.innerHTML =
        transactions.map(function(item) {

            let typeColor =
                "#38bdf8";

            if (
                item.type ===
                "DEPOSIT"
            ) {
                typeColor =
                    "#22c55e";
            }

            if (
                item.type ===
                "WITHDRAWAL"
            ) {
                typeColor =
                    "#ef4444";
            }

            if (
                item.type ===
                "ROI"
            ) {
                typeColor =
                    "#a855f7";
            }

            if (
                item.type ===
                "DIRECT_BONUS"
            ) {
                typeColor =
                    "#f59e0b";
            }

            if (
                item.type ===
                "TEAM_ROI"
            ) {
                typeColor =
                    "#06b6d4";
            }

            if (
                item.type ===
                "WALLET_CREDIT"
            ) {
                typeColor =
                    "#22c55e";
            }


            let statusColor =
                "#94a3b8";

            if (
                item.status ===
                "APPROVED" ||
                item.status ===
                "CREDITED"
            ) {
                statusColor =
                    "#22c55e";
            }

            if (
                item.status ===
                "REJECTED"
            ) {
                statusColor =
                    "#ef4444";
            }

            if (
                item.status ===
                "PENDING"
            ) {
                statusColor =
                    "#f59e0b";
            }


            return `

                <tr>

                    <td>
                        ${escapeHTML(
                            item.date
                        )}
                    </td>


                    <td>
                        <b>
                            ${escapeHTML(
                                item.userId
                            )}
                        </b>
                    </td>


                    <td>

                        <span
                            style="
                                color:${typeColor};
                                font-weight:800;
                                font-size:11px;
                            "
                        >
                            ${escapeHTML(
                                item.type
                            )}
                        </span>

                    </td>


                    <td>

                        <b>
                            ₹${money(
                                item.amount
                            )}
                        </b>

                    </td>


                    <td>

                        <span
                            style="
                                color:${statusColor};
                                font-weight:800;
                                font-size:11px;
                            "
                        >
                            ${escapeHTML(
                                item.status
                            )}
                        </span>

                    </td>


                    <td>

                        <small
                            style="
                                color:#94a3b8;
                            "
                        >
                            ${escapeHTML(
                                item.details
                            )}
                        </small>

                    </td>

                </tr>

            `;

        }).join("");

};


// =============================================================
// INITIALIZE TRANSACTION LEDGER
// =============================================================

function initializeTransactionLedger() {

    const admin =
        getCurrentUser();

    if (
        !admin ||
        admin.userId !== "AG1001"
    ) {
        return;
    }

    if (
        document.getElementById(
            "transactionLedgerBody"
        )
    ) {

        renderTransactionLedger();

    }

}

// =============================================================
// END
// =============================================================
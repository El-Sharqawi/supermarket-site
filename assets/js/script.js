import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBIRU1IXNFXOxXI3zagrTYqVOMj0bba1_Y",
    authDomain: "supermarket-3649b.firebaseapp.com",
    projectId: "supermarket-3649b",
    storageBucket: "supermarket-3649b.firebasestorage.app",
    messagingSenderId: "567505771647",
    appId: "1:567505771647:web:db7e1cecb15924a313734a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const productGrid = document.getElementById("product-grid");
const searchInput = document.getElementById("search");
const modal = document.getElementById("productModal");

const modalImage = document.getElementById("modal-image");
const modalName = document.getElementById("modal-name");
const modalPrice = document.getElementById("modal-price");
const modalCategory = document.getElementById("modal-category");
const modalStatus = document.getElementById("modal-status");
const modalWhatsappBtn = document.getElementById("modal-whatsapp-btn"); // تعريف زرار الواتساب

const closeModal = document.querySelector(".close-modal");
const categoriesContainer = document.getElementById("categories");

let allProducts = [];

function displayProducts(products){
    productGrid.innerHTML="";

    if (products.length === 0) {
        productGrid.innerHTML = `
            <div class="no-results">
                <i class="fa-solid fa-face-frown"></i>
                <h2>لا يوجد منتج بهذا الاسم</h2>
                <p>جرّب كلمة بحث أخرى.</p>
            </div>
        `;
        return;
    }

    products.forEach(product=>{
        const card=document.createElement("div");
        card.className="card";

        // الحل السحري لتعديل المسار أوتوماتيك لأي صورة قديمة أو محلية
        let imgPath = product.image;
        if (imgPath) {
            // لو المسار فيه الهارد القديم D:/ أو file:///، نطلع اسم الملف الأخير بس
            if (imgPath.includes("D:/") || imgPath.includes("file:///")) {
                const parts = imgPath.split("/");
                const fileName = parts[parts.length - 1];
                imgPath = "assets/images/" + fileName;
            } 
            // لو المسار مش بيبدأ بـ http (يعني مش رابط خارجي) ومش بـ assets، نظبطه
            else if (!imgPath.startsWith("http") && !imgPath.startsWith("assets/")) {
                const parts = imgPath.split("/");
                const fileName = parts[parts.length - 1];
                imgPath = "assets/images/" + fileName;
            }
        }

        card.innerHTML=`
            <img src="${imgPath}" alt="${product.productName}">
            <div class="card-body">
            <h3 class="product-name">
                ${product.productName}
            </h3>
            <div class="price-row">
                <span class="price">
                     ${product.price} جنيه 💰
                </span>
            </div>
            <span class="available ${product.available ? "" : "out"}">
                ${product.available ? "🟢 متوفر" : "🔴 غير متوفر"}
            </span>
            </div>
        `;
        productGrid.appendChild(card);

        card.addEventListener("click",()=>{
            modal.classList.add("show");
            modalImage.src = imgPath; // استخدام نفس المسار المعدل للـ Modal
            modalName.textContent = product.productName;
            modalPrice.textContent = product.price + " جنيه";
            modalCategory.textContent = "القسم : " + product.category;
            modalStatus.textContent = product.available ? "متوفر" : "غير متوفر";
            modalStatus.style.background = product.available ? "#2E7D32" : "#d32f2f";

            const whatsappMessage = encodeURIComponent(`مرحباً، أريد طلب هذا المنتج:\n- الاسم: ${product.productName}\n- السعر: ${product.price} جنيه`);
            if(modalWhatsappBtn) {
                modalWhatsappBtn.href = `https://wa.me/201152656520?text=${whatsappMessage}`;
            }
        });
    });

function createCategories(products){
    const categories = [...new Set(products.map(product => product.category))];
    categoriesContainer.innerHTML = "";

    const allButton = document.createElement("button");
    allButton.className = "category active";
    allButton.textContent = "الكل";
    allButton.dataset.category = "الكل";
    categoriesContainer.appendChild(allButton);

    categories.forEach(category =>{
        const button = document.createElement("button");
        button.className = "category";
        button.dataset.category = category;
        button.textContent = category;
        categoriesContainer.appendChild(button);
    });

    addCategoryEvents();
}

async function loadProductsFromFirestore() {
    try {
        const querySnapshot = await getDocs(collection(db, "products"));
        allProducts = [];
        querySnapshot.forEach((doc) => {
            allProducts.push({ id: doc.id, ...doc.data() });
        });
        displayProducts(allProducts);
        createCategories(allProducts);
    } catch (err) {
        console.log("خطأ في جلب المنتجات:", err);
    }
}

loadProductsFromFirestore();

searchInput.addEventListener("input",()=>{
    const value=searchInput.value.toLowerCase();
    const filtered = allProducts.filter(product => {
        return (
            product.productName.toLowerCase().includes(value) ||
            product.category.toLowerCase().includes(value) ||
            product.price.toString().includes(value)
        );
    });
    displayProducts(filtered);
});

function addCategoryEvents(){
    const buttons = document.querySelectorAll(".category");
    buttons.forEach(button=>{
        button.addEventListener("click",()=>{
            buttons.forEach(btn=>
                btn.classList.remove("active")
            );
            button.classList.add("active");
            const category = button.dataset.category;

            if(category==="الكل"){
                displayProducts(allProducts);
                return;
            }

            const filtered = allProducts.filter(product=>
                product.category===category
            );
            displayProducts(filtered);
        });
    });
}

closeModal.addEventListener("click",()=>{
    modal.classList.remove("show");
});

window.addEventListener("click",(e)=>{
    if(e.target===modal){
        modal.classList.remove("show");
    }
});

const backToTop = document.getElementById("backToTop");

window.addEventListener("scroll", () => {
    if(window.scrollY > 400){
        backToTop.classList.add("show");
    }else{
        backToTop.classList.remove("show");
    }
});

backToTop.addEventListener("click", () => {
    window.scrollTo({
        top:0,
        behavior:"smooth"
    });
});
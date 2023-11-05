document.addEventListener("readystatechange", (evt) => {
    if (evt.target.readyState === "complete") {
        initApp();
    }
});
const initApp = () => {
    const medElements = document.querySelectorAll(".card");
    medElements.forEach((med) => {
        med.addEventListener("click", (evt) => {
           window.location.assign(`/pharmacy/${med.id}`);
        });
    });
}



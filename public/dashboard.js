document.addEventListener("readystatechange", (evt) => {
    if (evt.target.readyState === "complete") {
        initApp();
    }
});
const initApp = () => {
    const element = document.querySelector("#profile");
    const el = document.querySelector('#userInfo')
    element.addEventListener('click', (e) => {
        el.style.display = "block";
        e.stopPropagation();
    })
    document.addEventListener("click", (e) => {
        el.style.display = "none";
    })
}
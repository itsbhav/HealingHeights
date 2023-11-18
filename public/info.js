document.addEventListener("readystatechange", (evt) => {
    if (evt.target.readyState === "complete") {
        initApp();
    }
});
const initApp = () => {
   const el1 = document.querySelectorAll('.disease');
    const el2 = document.querySelectorAll('.comment');
    const el3 = document.querySelector('.hide1');
    const el4= document.querySelector('.hide2');
    el3.addEventListener('click', (e) => {
        console.log("hi")
        el1.forEach((x) => {
            // console.log(x)
            if (x.style.display != 'none') x.style.display = "none";
            else {
                x.style.display = 'flex';
            }
        })
    })
    el4.addEventListener('click', (e) => {
        // console.log("hi")
        el2.forEach((x) => {
             if (x.style.display != 'none') x.style.display = "none";
            else {
                x.style.display = 'flex';
            }
        })
    })

}
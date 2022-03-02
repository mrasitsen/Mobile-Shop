
/*
@todo: hepsini done veya success yap dene
@todo: empty() neden orada calisti ?
@todo: submit() fonksiuyonu ne ise yarar azk ?
@todo: input form to json kisayol ???
@todo: event.preventDefault(); ekle, event nedir ogren
*/

/**
 * This piece of code has been taken from: https://codepen.io/dcode-software/pen/zYGOrzK
 * Also this code has been explained in this video: https://www.youtube.com/watch?v=8SL_hM1a0yo
 * This code is not totally identical, we modified it to add dynamic sorting functionality
 * 
 * Sorts a HTML table.
 * @param {HTMLTableElement} table The table to sort
 * @param {number} column The index of the column to sort
 * @param {boolean} asc Determines if the sorting will be in ascending
 */
function sortTableByColumn(table, column, asc = true) {
    const dirModifier = asc ? 1 : -1;
    const tBody = table.tBodies[0];
    const rows = Array.from(tBody.querySelectorAll("tr"));

    // Sort each row
    const sortedRows = rows.sort((a, b) => {
        const aColText = a.querySelector(`td:nth-child(${column + 1})`).textContent.trim();
        const bColText = b.querySelector(`td:nth-child(${column + 1})`).textContent.trim();
        return aColText > bColText ? (1 * dirModifier) : (-1 * dirModifier);
    });

    // Remove all existing TRs from the table
    while (tBody.firstChild) {
        tBody.removeChild(tBody.firstChild);
    }

    // Re-add the newly sorted rows
    tBody.append(...sortedRows);

    // Remember how the column is currently sorted
    table.querySelectorAll("th").forEach(th => th.classList.remove("th-sort-asc", "th-sort-desc"));
    table.querySelector(`th:nth-child(${column + 1})`).classList.toggle("th-sort-asc", asc);
    table.querySelector(`th:nth-child(${column + 1})`).classList.toggle("th-sort-desc", !asc);
}

function setupSort() {
    //Setups the sorting algorithm
    document.querySelectorAll(".product-table th").forEach(headerCell => {
        headerCell.addEventListener("click", () => {
            const tableElement = headerCell.parentElement.parentElement.parentElement;
            const headerIndex = Array.prototype.indexOf.call(headerCell.parentElement.children, headerCell);
            const currentIsAscending = headerCell.classList.contains("th-sort-asc");
            sortTableByColumn(tableElement, headerIndex, !currentIsAscending);
        });
    })
};

//Below this line, functions are all belong to the students.


//Delete the products in the database



function getProducts() {

    /*
    This function retrieves the product list from database.
    After gettting them, it sorts.
    By default, table is getting sort by OS, in desc. order.
    */

    let requestData = []

    $.ajax({
        url: "http://localhost:3000/product",
        method: "GET",
        data: requestData,
        dataType: "json"
    }).done(function (data) {
        $("#productTable tbody").empty()
        data.map((element) => {
            let tr = "<tr>"
            tr = tr.concat("<td> <img src=" + '"' + element.image + '"' + " alt='phone'></td>")
            tr = tr.concat("<td class='brand'>" + element.brand + "</td>")
            tr = tr.concat("<td>" + element.model + "</td>")
            tr = tr.concat("<td class='os'>" + element.os + "</td>")
            tr = tr.concat("<td>" + element.screensize + "</td></tr>")
            $('#productTable tbody').append(tr)
        })
        sortTableByColumn(document.querySelector("#productTable table"), 3, true);
    })
}



function addItem(event) {

    /*
    This function adds item to the database. After sending, it dynamicly sorts the table.
    By default, table is getting sort by OS, in desc. order.
    */

    let image = $("#image").val()
    let brand = $("#brand").val()
    let model = $("#model").val()
    let os = $("#os").val()
    let screensize = $("#screensize").val()

    $.ajax({
        url: "http://localhost:3000/product",
        method: "POST",
        data: {
            "image": image,
            "brand": brand,
            "model": model,
            "os": os,
            "screensize": screensize
        },
        dataType: "json",
    }).done(() => {
        getProducts()
    })
    event.preventDefault();
}

function resetTable(event) {
    $.ajax({
        url: "http://localhost:3000/delete",
        method: "DELETE"
    }).done(() => {
        getProducts()
    })
    event.preventDefault();
}


//The first initialization of the page

$(function () {
    setupSort();
    getProducts();
    $("#reset").click(resetTable);
    $("#submitButton").click(addItem);
});


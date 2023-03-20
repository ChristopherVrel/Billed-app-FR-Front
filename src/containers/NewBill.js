import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
    constructor({ document, onNavigate, store, localStorage }) {
        this.document = document;
        this.onNavigate = onNavigate;
        this.store = store;
        this.fileUrl = null;
        this.fileName = null;
        this.isValidFile = false;
        this.billId = null;

        const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`);
        const file = this.document.querySelector(`input[data-testid="file"]`);

        formNewBill.addEventListener("submit", this.handleSubmit);
        file.addEventListener("change", this.handleChangeFile);

        new Logout({ document, localStorage, onNavigate });
    }

    handleChangeFile = e => {
        e.preventDefault();

        // https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_Types
        const authorizedFileType = ["image/jpeg", "image/png"];

        const file = this.document.querySelector(`input[data-testid="file"]`).files[0];
        const filePath = e.target.value.split(/\\/g);
        const fileName = filePath[filePath.length-1];
        const formData = new FormData();
        const email = JSON.parse(localStorage.getItem("user")).email;

        formData.append("file", file);
        formData.append("email", email);

        this.isValidFile = (authorizedFileType.includes(file.type)) ? true : false;

        (this.document.querySelector("#errMsg")) ? this.document.querySelector("#errMsg").remove() : "";

        if (this.isValidFile) {
            this.store
                .bills()
                .create({
                    data: formData,
                    headers: {
                        noContentType: true
                    }
                })
                .then(({ fileUrl, key }) => {
                    this.billId = key;
                    this.fileUrl = fileUrl;
                    this.fileName = fileName;
                }).catch(error => console.error(error));
        }
        else {
            let el = this.document.createElement("div");
            el.id = "errMsg";
            el.setAttribute("data-testid", "errMsg");
            el.innerText = "Format de fichier non supporté";
            

            this.document.querySelector(`input[data-testid="file"]`).parentNode.append(el);
        }
    }

    handleSubmit = e => {
        e.preventDefault();

        const email = JSON.parse(localStorage.getItem("user")).email;
        const bill = {
            email,
            type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
            name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
            amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
            date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
            vat: e.target.querySelector(`input[data-testid="vat"]`).value,
            pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
            commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
            fileUrl: this.fileUrl,
            fileName: this.fileName,
            status: "pending"
        };

        console.log(bill);

        if (this.isValidFile) {
            this.updateBill(bill);
            this.onNavigate(ROUTES_PATH["Bills"]);
        }
    }

    // not need to cover this function by tests
    /* istanbul ignore next */
    updateBill = (bill) => {
        if (this.store) {
            this.store
                .bills()
                .update({data: JSON.stringify(bill), selector: this.billId})
                .then(() => {
                    this.onNavigate(ROUTES_PATH["Bills"]);
                })
                .catch(error => console.error(error));
        }
    }
}
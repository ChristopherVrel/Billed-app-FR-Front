/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";

import { fireEvent, screen } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import userEvent from "@testing-library/user-event";
import store from "../app/Store.js";
import { bills } from "../fixtures/bills";
import { ROUTES } from "../constants/routes.js";
import mockedStore from "../__mocks__/store.js";
import BillsUI from "../views/BillsUI.js";

describe("Given I am connected as an employee", () => {
    Object.defineProperty(window, "localStorage", { value: localStorageMock });
            
    window.localStorage.setItem("user", JSON.stringify({
      type: "Employee"
    }));

    describe("When I am on NewBill Page", () => {
        test("Then It should show a form with multiple input and a submit button", () => {
            document.body.innerHTML = NewBillUI();
            
            expect(screen.getByTestId("form-new-bill")).toBeTruthy();

            expect(screen.getByTestId("expense-type")).toBeTruthy();
            expect(screen.getByTestId("expense-name")).toBeTruthy();
            expect(screen.getByTestId("datepicker")).toBeTruthy();
            expect(screen.getByTestId("amount")).toBeTruthy();
            expect(screen.getByTestId("vat")).toBeTruthy();
            expect(screen.getByTestId("pct")).toBeTruthy();
            expect(screen.getByTestId("commentary")).toBeTruthy();
            expect(screen.getByTestId("file")).toBeTruthy();

            expect(screen.getByTestId("btn-send-bill")).toBeTruthy();
        });
    });

    describe("When I am on NewBill Page & i want to add a new file", () => {
        test("Then It should only accept jpg, jpeg & png file type", () => {
            Object.defineProperty(window, "localStorage", { value: localStorageMock });
            
            window.localStorage.setItem("user", JSON.stringify({
              type: "Employee"
            }));

            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };

            document.body.innerHTML = NewBillUI();

            const newBill = new NewBill({
              document, onNavigate, store, localStorage
            });

            const handleChangeFile = jest.fn(newBill.handleChangeFile);
            const fileInput = screen.getByTestId("file");
            const testFile = new File(["image"], "image.png", { type: "image/png" });

            fileInput.addEventListener("change", handleChangeFile);
            userEvent.upload(fileInput, testFile);

            expect(handleChangeFile).toHaveBeenCalled();
            expect(fileInput.files[0].name).toEqual("image.png");
            expect(screen.queryByTestId("errMsg")).toBeNull();
        });
        test("Then It should create an error message if the file is not supported", () => {
            Object.defineProperty(window, "localStorage", { value: localStorageMock });
            
            window.localStorage.setItem("user", JSON.stringify({
              type: "Employee"
            }));

            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };

            document.body.innerHTML = NewBillUI();

            const newBill = new NewBill({
              document, onNavigate, store, localStorage
            });

            const handleChangeFile = jest.fn(newBill.handleChangeFile);
            const fileInput = screen.getByTestId("file");
            const testFile = new File(["image"], "image.gif", { type: "image/gif" });

            fileInput.addEventListener("change", handleChangeFile);
            userEvent.upload(fileInput, testFile);

            expect(handleChangeFile).toHaveBeenCalled();
            expect(fileInput.files[0].name).toEqual("image.gif");
            expect(screen.queryByTestId("errMsg")).toBeTruthy();
        });
        test("Then It should not submit the form when the file is not valid", () => {
            Object.defineProperty(window, "localStorage", { value: localStorageMock });
            
            window.localStorage.setItem("user", JSON.stringify({
              type: "Employee"
            }));

            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };

            document.body.innerHTML = NewBillUI();

            const newBill = new NewBill({
              document, onNavigate, store, localStorage
            });

            const handleChangeFile = jest.fn(newBill.handleChangeFile);
            const fileInput = screen.getByTestId("file");
            const testFile = new File(["image"], "image.gif", { type: "image/gif" });

            fileInput.addEventListener("change", handleChangeFile);
            userEvent.upload(fileInput, testFile);

            expect(handleChangeFile).toHaveBeenCalled();
            expect(fileInput.files[0].name).toEqual("image.gif");
            expect(screen.queryByTestId("errMsg")).toBeTruthy();

            const form = screen.getByTestId("form-new-bill");
            const handleSubmit = jest.fn(newBill.handleSubmit);
            const update = jest.fn(newBill.updateBill);
            form.addEventListener("submit", handleSubmit);
            fireEvent.submit(form);

            expect(handleSubmit).toHaveBeenCalled();
            expect(update).not.toHaveBeenCalled();
        });
    });

    describe("When i want to POST a new bill", () => {
        test("Then all fields need beed to be filled correctly render the bills page", async () => {
            const testFile = new File(["image"], bills[0].fileName, { type: "image/png" });
            
            Object.defineProperty(window, "localStorage", { value: localStorageMock });
            
            window.localStorage.setItem("user", JSON.stringify({
              type: "Employee"
            }));

            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };

            document.body.innerHTML = NewBillUI();

            const newBill = new NewBill({
              document, onNavigate, store: mockedStore, localStorage
            });

            userEvent.selectOptions(screen.getByTestId("expense-type"), screen.getByText(bills[0].type));
            userEvent.type(screen.getByTestId("expense-name"), bills[0].name);
            fireEvent.change(screen.getByTestId("datepicker"), { target: { value: bills[0].date } });
            userEvent.type(screen.getByTestId("amount"), bills[0].amount.toString());
            userEvent.type(screen.getByTestId("vat"), bills[0].vat);
            userEvent.type(screen.getByTestId("pct"), bills[0].pct.toString());
            userEvent.type(screen.getByTestId("commentary"), bills[0].commentary);
            userEvent.upload(screen.getByTestId("file"), testFile);

            expect(screen.getByText(bills[0].type).selected).toBe(true);
            expect(screen.getByTestId("expense-name").value).toEqual(bills[0].name);
            expect(screen.getByTestId("datepicker").value).toEqual(bills[0].date);
            expect(screen.getByTestId("amount").valueAsNumber).toEqual(bills[0].amount);
            expect(screen.getByTestId("vat").value).toEqual(bills[0].vat);
            expect(screen.getByTestId("pct").valueAsNumber).toEqual(bills[0].pct);
            expect(screen.getByTestId("commentary").value).toEqual(bills[0].commentary);
            expect(screen.getByTestId("file").files[0].name).toEqual(bills[0].fileName);

            const form = screen.getByTestId("form-new-bill");
            const handleSubmit = jest.fn(newBill.handleSubmit);
            const mockedSpy = jest.spyOn(mockedStore, "bills");

            form.addEventListener("submit", handleSubmit);
            fireEvent.submit(form);

            expect(handleSubmit).toHaveBeenCalled();

            const response = await mockedStore.bills().create(bills[0]);
            
            expect(mockedSpy).toHaveBeenCalled();
            expect(response.fileUrl).toBe("https://localhost:3456/images/test.jpg");
            expect(response.key).toBe("1234");

            expect(screen.getAllByText("Mes notes de frais")).toBeTruthy();
        });
    });

    describe("When an error occurs on API", () => {
        beforeEach(() => jest.spyOn(mockedStore, "bills"));

        test("Fails with 404 message error", async () => {
            const error = "Erreur 404";

            mockedStore.bills.mockImplementationOnce(() => {
                return {
                    list : () =>  {
                        return Promise.reject(new Error(error));
                    }
                }
            });

            document.body.innerHTML = BillsUI({ error: error });

            const message = await screen.getByText(/Erreur 404/);
            expect(message).toBeTruthy();
        });

        test("Fails with 500 message error", async () => {
            const error = "Erreur 500";

            mockedStore.bills.mockImplementationOnce(() => {
                return {
                    list : () =>  {
                        return Promise.reject(new Error(error));
                    }
                }
            });

            document.body.innerHTML = BillsUI({ error: error });

            const message = await screen.getByText(/Erreur 500/);
            expect(message).toBeTruthy();
        });
    });
});
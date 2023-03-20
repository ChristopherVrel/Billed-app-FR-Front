/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import Bills from "../containers/Bills.js"
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockedStore from "../__mocks__/store.js";
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
    describe("When I am on Bills Page", () => {
        test("Then bill icon in vertical layout should be highlighted", async () => {
            Object.defineProperty(window, "localStorage", { value: localStorageMock });
            
            window.localStorage.setItem("user", JSON.stringify({
                type: "Employee"
            }));
            
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.append(root);
            router();

            window.onNavigate(ROUTES_PATH.Bills);
            
            await waitFor(() => screen.getByTestId("icon-window"));
            const windowIcon = screen.getByTestId("icon-window");
            //to-do write expect expression
            expect(windowIcon).toHaveClass("active-icon");
        });

        test("Then bills should be ordered from earliest to latest", () => {
            document.body.innerHTML = BillsUI({ data: bills });
            const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerText);
            const antiChrono = (a, b) => ((a < b) ? 1 : -1);
            const datesSorted = [...dates].sort(antiChrono);
            
            expect(dates).toEqual(datesSorted);
        });

        test("Then clicking on eye icon should show a modal", async () => {
            Object.defineProperty(window, "localStorage", { value: localStorageMock });
            
            window.localStorage.setItem("user", JSON.stringify({
              type: "Employee"
            }));

            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };

            document.body.innerHTML = BillsUI({ data: bills });

            const bill = new Bills({
              document, onNavigate, store: null, localStorage
            });

            $.fn.modal = jest.fn();
            
            expect(screen.getByText("Mes notes de frais")).toBeTruthy();

            const allEyeBtn = screen.getAllByTestId("icon-eye");

            expect(allEyeBtn).not.toBeNull();

            allEyeBtn.forEach(eyeEl => {
                // check if all elements have id="eye"
                // btw id need to be unique => fix & use toHaveClass instead
                expect(eyeEl.id).toEqual("eye");

                const handleClickIconEye = jest.fn(bill.handleClickIconEye);

                eyeEl.addEventListener("click", handleClickIconEye(eyeEl));
                userEvent.click(eyeEl);

                expect(handleClickIconEye).toHaveBeenCalled();
                expect(screen.getByTestId("modaleFile")).toBeTruthy();
            });
        });

        test("Then clicking on new bills button should redirect to new bills", async () => {
            Object.defineProperty(window, "localStorage", { value: localStorageMock });
            
            window.localStorage.setItem("user", JSON.stringify({
              type: "Employee"
            }));

            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };

            document.body.innerHTML = BillsUI({ data: bills });

            const bill = new Bills({
              document, onNavigate, store: null, localStorage
            });

            const handleClickNewBill = jest.fn(bill.handleClickNewBill);
            
            const newBillBtn = screen.getByTestId("btn-new-bill");
            expect(newBillBtn).toHaveClass("btn btn-primary");

            newBillBtn.addEventListener("click", handleClickNewBill);
            userEvent.click(newBillBtn);

            expect(handleClickNewBill).toHaveBeenCalled();
            expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
        });
    });

    describe("When I am on Bills Page", () => {
        test("Then fetches bills from mock API GET", async () => {
            Object.defineProperty(window, "localStorage", { value: localStorageMock });
            
            window.localStorage.setItem("user", JSON.stringify({
              type: "Employee"
            }));

            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };

            document.body.innerHTML = BillsUI({ data: bills });

            const bill = new Bills({
              document, onNavigate, store: mockedStore, localStorage
            });

            await waitFor(() => screen.getByText("Mes notes de frais"));

            const newBillBtn = screen.getByTestId("btn-new-bill");
            expect(newBillBtn).toBeTruthy();

            const data = await bill.getBills();
            expect(data.length).toBe(4);
        });
    });

    describe("When an error occurs on API", () => {
        beforeEach(() => jest.spyOn(mockedStore, "bills"));

        test("fetches bills from an API and fails with 404 message error", async () => {
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

        test("fetches messages from an API and fails with 500 message error", async () => {
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

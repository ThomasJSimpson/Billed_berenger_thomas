/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store";
import store from "../__mocks__/store";
import router from "../app/Router.js";
import { ROUTES_PATH, ROUTES } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the form should be rendered ", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "a@a",
        })
      );

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      await waitFor(() => screen.getByText("Envoyer une note de frais"));

      const form = screen.getByTestId("form-new-bill");
      const inputType = screen.getByTestId("expense-type");
      const inputName = screen.getByTestId("expense-name");
      const inputDate = screen.getByTestId("datepicker");
      const inputAmount = screen.getByTestId("amount");
      const inputVat = screen.getByTestId("vat");
      const inputPct = screen.getByTestId("pct");
      const inputComment = screen.getByTestId("commentary");
      const inputFile = screen.getByTestId("file");

      expect(form).toBeTruthy();
      expect(inputType).toBeTruthy();
      expect(inputName).toBeTruthy();
      expect(inputDate).toBeTruthy();
      expect(inputAmount).toBeTruthy();
      expect(inputVat).toBeTruthy();
      expect(inputPct).toBeTruthy();
      expect(inputComment).toBeTruthy();
      expect(inputFile).toBeTruthy();
    });

    test("Then I should be able to enter values into the differents inputs", () => {
      // Input datas
      const formData = {
        type: "Transports",
        name: "TEST01",
        amount: "300",
        date: "2022-04-09",
        vat: 34,
        pct: 54,
        file: new File(["img"], "test.jpg", { type: "image/jpg" }),
        commentary: "commentaire",
      };

      const inputType = screen.getByTestId("expense-type");
      const inputName = screen.getByTestId("expense-name");
      const inputDate = screen.getByTestId("datepicker");
      const inputAmount = screen.getByTestId("amount");
      const inputVat = screen.getByTestId("vat");
      const inputPct = screen.getByTestId("pct");
      const inputComment = screen.getByTestId("commentary");
      const inputFile = screen.getByTestId("file");

      // Edit input
      fireEvent.change(inputType, { target: { value: formData.type } });
      fireEvent.change(inputName, { target: { value: formData.name } });
      fireEvent.change(inputDate, { target: { value: formData.date } });
      fireEvent.change(inputAmount, { target: { value: formData.amount } });
      fireEvent.change(inputVat, { target: { value: formData.vat } });
      fireEvent.change(inputPct, { target: { value: formData.pct } });
      fireEvent.change(inputComment, { target: { value: formData.commentary } });

      expect(inputType.value).toBe("Transports");
      expect(inputName.value).toBe("TEST01");
      expect(inputDate.value).toBe("2022-04-09");
      expect(inputAmount.value).toBe("300");
      expect(inputVat.value).toBe("34");
      expect(inputPct.value).toBe("54");
      expect(inputComment.value).toBe("commentaire");
    });

    test("Then I should be able to upload an image in the input file", () => {
      // Input datas
      const formData = {
        type: "Transports",
        name: "TEST01",
        amount: "300",
        date: "2022-04-09",
        vat: 34,
        pct: 54,
        file: new File(["img"], "test.jpg", { type: "image/jpg" }),
        commentary: "commentaire",
      };

      const inputFile = screen.getByTestId("file");

      const newBills = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });
      const handleChangeFile = jest.fn((e) => newBills.handleChangeFile(e));

      inputFile.addEventListener("change", handleChangeFile);
      fireEvent.click(inputFile);
      userEvent.upload(inputFile, formData.file);

      expect(handleChangeFile).toHaveBeenCalled();
      expect(inputFile.files[0]).toBeTruthy();
      expect(inputFile.files[0].name).toBe("test.jpg");
      expect(inputFile.files[0]).toStrictEqual(formData.file);
      expect(inputFile.files.length).toBe(1);
    });
  });
});

describe("Given I am a user connected as Employee", () => {
  describe("When I am on NewBills page and i submit a correct form", () => {
    test("Then a bill should be created(CREATE/POST) ", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "a@a",
        })
      );

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);

      await waitFor(() => screen.getByText("Envoyer une note de frais"));

      const NewBills = new NewBill({
        document,
        onNavigate,
        store,
        localStorage,
      });

      const form = screen.getByTestId("form-new-bill");
      const nameInput = screen.getByTestId("expense-name");
      fireEvent.input(nameInput, { target: { value: "encore" } });
      expect(nameInput.value).toBe("encore");

      const dateInput = screen.getByTestId("datepicker");
      fireEvent.input(dateInput, { target: { value: "2004-04-04" } });
      expect(dateInput.value).toBe("2004-04-04");

      const amountInput = screen.getByTestId("amount");
      fireEvent.input(amountInput, { target: { value: "400" } });
      expect(amountInput.value).toBe("400");

      const tvaInput = screen.getByTestId("pct");
      fireEvent.input(tvaInput, { target: { value: "20" } });
      expect(tvaInput.value).toBe("20");

      const inputFile = screen.getByTestId("file");
      const fakeFile = new File(["test"], "test.jpg", { type: "image/png" });

      const handleChangeFile = jest.fn((e) => NewBills.handleChangeFile(e));

      inputFile.addEventListener("change", handleChangeFile);
      fireEvent.click(inputFile);
      userEvent.upload(inputFile, fakeFile);

      // we have to use mockStore to simulate add of bill image
      const billImageAdd = mockStore.bills().create();
      const addedImage = await billImageAdd.then((value) => {
        return value;
      });

      expect(addedImage.fileUrl).toEqual("https://localhost:3456/images/test.jpg");
      expect(addedImage.key).toEqual("1234");

      const handleSubmit = jest.fn((e) => NewBills.handleSubmit(e));

      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();

      // we have to use mockStore to simulate bill creation
      const updateBill = mockStore.bills().update();
      const addedBill = await updateBill.then((value) => {
        return value;
      });

      expect(addedBill.id).toEqual("47qAXb6fIm2zOKkLzMro");
      expect(addedBill.amount).toEqual(400);
      expect(addedBill.fileUrl).toEqual("https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a");

      await waitFor(() => screen.getByText("Mes notes de frais"));

      expect(screen.getByText("Mes notes de frais")).toBeTruthy();
      expect(screen.getByText("Nouvelle note de frais")).toBeTruthy();

      const bill1 = screen.getByText("test1");
      expect(bill1).toBeTruthy();
      const bill2 = screen.getByText("test2");
      expect(bill2).toBeTruthy();
      const bill3 = screen.getByText("test3");
      expect(bill3).toBeTruthy();
      const bill4 = screen.getByText("encore");
      expect(bill4).toBeTruthy();
    });
  });
});

describe("Given I am a user connected as Employee", () => {
  describe("When i am on NewBill page and i submit a form, ", () => {
    test("fails with a message error", async () => {
      jest.spyOn(mockStore, "bills");
      console.error = jest.fn();
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "a@a",
        })
      );

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.appendChild(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      mockStore.bills.mockImplementationOnce(() => {
        return {
          update: () => {
            return Promise.reject(new Error("Erreur 404"));
          },
        };
      });

      const newBill = new NewBill({ document, onNavigate, store: mockStore, localStorage: window.localStorage });
      const form = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      await new Promise(process.nextTick);
      expect(console.error).toBeCalled();
      const error = console.error.mock.calls[0][0];
      expect(error).toMatchObject(Error("Erreur 404"));
    });
  });
});

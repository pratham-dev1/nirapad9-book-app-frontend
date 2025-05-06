import React, { useState } from "react";
import CustomButton from "../components/CustomButton";
import { SERVER_URL } from "../services/axios";
import CustomAutocomplete from "../components/CustomAutocomplete";
import CustomTextField from "../components/CustomTextField";
import DragDropSkills from "../components/DragDropSkills";
import { SubscriptionTypes } from "../utils/Enums";

const PaymentPlans = () => {
  const plan1Amount = 100;
  const plan2Amount = 150;
  const plan3Amount = 200;
  const [qtyForPlan1, setQtyForPlan1] = useState("1");
  const [qtyForPlan2, setQtyForPlan2] = useState("1");
  const [qtyForPlan3, setQtyForPlan3] = useState("1");
  const [priceForPlan1, setPriceForPlan1] = useState(100);
  const [priceForPlan2, setPriceForPlan2] = useState(150);
  const [priceForPlan3, setPriceForPlan3] = useState(200);

  const handleQtyChange = (value: string, plan: string) => {
    if (plan === "plan1") {
      setQtyForPlan1(value);
      setPriceForPlan1(value ? plan1Amount * +value : plan1Amount);
    } else if (plan === "plan2") {
      setQtyForPlan2(value);
      setPriceForPlan2(value ? plan2Amount * +value : plan2Amount);
    } else if (plan === "plan3") {
      setQtyForPlan3(value);
      setPriceForPlan3(value ? plan3Amount * +value : plan3Amount);
    }
  };

  return (
    <>
      <h1>Plans</h1>
      <div style={{ display: "flex", justifyContent: "space-evenly" }}>
        <div>
          <h4>(Basic)</h4>
          <h4>Pay {`$${priceForPlan1}`}</h4>
          <form action={`${SERVER_URL}/api/payment/create-checkout-session/${plan1Amount}/${qtyForPlan1}/${SubscriptionTypes.BASIC}`}
            method="POST"
          >
            <CustomTextField
              label="qty"
              // onChange={(e) => handleQtyChange(e.target.value, "plan1")}
              value={qtyForPlan1}
              onChange={(e) => {
                const newValue = e.target.value;
                if (/^\d*$/.test(newValue)) {
                  handleQtyChange(newValue, "plan1");
                }
              }}
              onBlur={(e) => setQtyForPlan1(e.target.value ? e.target.value : 1)}
            />{" "}
            <br />
            <CustomButton label="Pay" type="submit" />
          </form>
        </div>
        <div>
        <h4>(Advanced)</h4>
          <h4>Pay {`$${priceForPlan2}`}</h4>
          <form action={`${SERVER_URL}/api/payment/create-checkout-session/${plan2Amount}/${qtyForPlan2}/${SubscriptionTypes.ADVANCED}`}
            method="POST"
          >
            <CustomTextField
              label="qty"
              onChange={(e) => handleQtyChange(e.target.value, "plan2")}
              value={qtyForPlan2}
              onBlur={(e) => setQtyForPlan2(e.target.value ? e.target.value : 1)}
            />
            <br />
            <CustomButton label="Pay" type="submit" />
          </form>
        </div>
        <div>
        <h4>(Professional)</h4>
          <h4>Pay {`$${priceForPlan3}`}</h4>
          <form action={`${SERVER_URL}/api/payment/create-checkout-session/${plan3Amount}/${qtyForPlan3}/${SubscriptionTypes.PROFESSIONAL}`}
            method="POST"
          >
            <CustomTextField
              label="qty"
              onChange={(e) => handleQtyChange(e.target.value, "plan3")}
              value={qtyForPlan3}
              onBlur={(e) => setQtyForPlan3(e.target.value ? e.target.value : 1)}
            />
            <br />
            <CustomButton label="Pay" type="submit" />
          </form>
        </div>
      </div>
      <DragDropSkills />
    </>
  );
};

export default PaymentPlans;

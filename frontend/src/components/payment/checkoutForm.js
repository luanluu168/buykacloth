import React from 'react';
import {CardElement, useStripe, useElements} from '@stripe/react-stripe-js';
import CustomCardElement from './cardElement';
import BillingDetail from './billingDetailFields';
import { bindActionCreators } from 'redux';
import { resetCookieAndCart } from '../../actions';
import { connect } from 'react-redux';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import SubmitButton from './submitButton';

const CheckoutForm = (props) => {
  const   stripe = useStripe();
  const elements = useElements();
  let    history = useHistory();

  // const [validPayment, setValidPayment] = useState(false);

  const handleSubmit = async (event) => {
    // Block native form submission.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }

    const card = elements.getElement(CardElement);
    const result = await stripe.createToken(card);
    if (result.error) {
        console.log(result.error.message);
    } else {
        // console.log("----Result", result.token);

        let  name = window.$('#cardOwnerName').val();
        let phone = window.$('#cardOwnerPhone').val();

        let route = `/stripe/payment/name=${name}&phone=${phone}&amount=${props.total}`;
        axios.post(route, result.token)
            .then(response => {
                // close modal and process receipt 
                closeModal();
                route = `/Receipt/${props.oId}&pt=${props.paymentType}`;
                axios.post(route)
                    .then(response => {
                        if(response.data) {
                          history.push(`/Receipt/${props.oId}`);
                        }
                    })
                    .catch(err => console.log(err));
            })
            .catch(error => {
                console.log("Payment Error: ", error);
                alert("Payment Has Error");
            });
    }
  };

  const closeModal = () => {
    window.$("#paymentModal").modal("hide");
    props.resetCookieAndCart();
  }

  // const stripeElementChange = (element) => {
  //   if (element.complete && window.$('#cardOwnerName').val().length !== 0 && window.$('#cardOwnerPhone').val().length !== 0) {
  //     setValidPayment(true);
  //     // enable payment button
  //   } else if (element.error) {
  //     setValidPayment(false);
  //     // show validation to customer
  //   } else if (element.empty) {
  //     setValidPayment(false);
  //   }
  // }
  
  return (
          <div className="row justify-content-center">
            <div className="col">
              <div className="card">
                  <div className="card-header bg-secondary text-white">
                    <h4 className="text-center mb-3 mt-3"> Card Detail </h4>
                  </div>
                  <div className="card-body">
                    <ul className="list-group">
                      <form onSubmit={handleSubmit}>
                          <fieldset className="FormGroup">
                            <BillingDetail />

                            <div className="FormRow">
                                <CustomCardElement />
                            </div>
                          </fieldset>
                         
                          <div className="text-center">
                            <SubmitButton total={props.total} stripe={stripe}/>
                          </div>
                      </form>
                    </ul>
                  </div>
              </div>
            </div>
          </div>
  );
};

const mapDispatchToProps = (dispatch) => {
  return bindActionCreators({
    resetCookieAndCart: resetCookieAndCart
  }, dispatch)
}

export default connect(null, mapDispatchToProps)(CheckoutForm);
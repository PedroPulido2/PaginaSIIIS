import Contact_Us from "../components/ContactUs";
import emailjs from "emailjs-com";

const Email = () => {
  function sendEmail(e) {
    e.preventDefault();

    emailjs
      .sendForm(
        "service_f3257sq",
        "template_fxqjp1f",
        e.target,
        "user_5X9G3MqKj0zH8k1hJg2xQ"
      )
      .then(
        (result) => {
          console.log("Mensaje enviado, nos pondremos en contacto con usted en breve",result.text);
        },
        (error) => {
          console.log("Se ha producido un error, por favor, inténtelo de nuevo",error.text);
        }
      );
  }

  return (
    <div>
      <Contact_Us sendEmail={sendEmail} />
    </div>
  );
};

export default Email;

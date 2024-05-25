class ErrorMessage extends Error {
    constructor(errorMessage) {
        super(errorMessage.message);
        this.status = errorMessage.status;
    }
}

export default ErrorMessage;
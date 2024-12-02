export default function UserKYC() {
    return (<>
        <label htmlFor="imageMedia">
            <img src="public/capture.png" alt="Capture Pics" />
            <input type="file" name="imageMedia" id="imageMedia" accept="image/*" capture="environment" />
        </label>
    </>)
}
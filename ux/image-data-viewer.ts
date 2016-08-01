import $ = require("jquery");

let data = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAGCAYAAADgzO9IAAAAF0lEQVQIW2O0rmLrOtr2q4wBDTAOpAQAuYQYB1lDoxAAAAAASUVORK5CYII=";

let css = `
<style>
    img {
        width: auto;
        height: auto;
        border: 1px dashed rgba(0, 0, 0, 0.5);
        padding: 20px;
    }

    label {
        display: block;
    }

    textarea {
        min-width: 240px;
        min-height: 240px;
    }
</style>
`;

let ux = `
<div class="image-data-viewer">
    <h3>Tool for viewing image data</h3>
    <p>Paste image data into Image Data to see the image under Image</p>
    <label>Image Data</label> 
    <textarea class='image-data-input'></textarea>
    <label>Image</label> 
    <img class='image'/>
</div>
`;

export function run() {
    $(ux).appendTo(".map");
    $(css).appendTo("head");

    $(".image-data-input").change(() => {
        $(".image").attr("src", $(".image-data-input").val());
    }).val(data).change();
}

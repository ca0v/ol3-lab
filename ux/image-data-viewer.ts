import $ = require("jquery");

let data = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAA9CAYAAAAd1W/BAAAFf0lEQVRoBe1ZSW/bRhT+uFMSZcmSAnlpHCcokKZo0QU9t7321n/QnnvqHyjQn9Cf0GuvRU89Feg5AdIGDro5tuPd1mItJKWhyOKNRMRwpFjcZAviAATJ4XDee998b97MGwGAhwUu4gLbzk1PAUgZsOAIpC6w4ARAyoCUAQuOwO1xAQEAXTMu8ozlDcUJQ1sFCRBEASK/Dz95A8AdAJ7rwXNH6/QEF+uzBUAAJBmQNRGyJkDPy1BzCjRDgZqVucG9Th9904HdZuh3HTg9D07f46AksWuZDQAjw5WMCOOOhtJGHssbeeRKOiRF4pcoivA8MtTlF7MddE5N1HZbaOx3YNYZHHsERIy0Ja9LkGBDv1Z0AUsrGqoPiyjfLyJXzkLNqJBUCYIw3vHJBViPWNBD58zE8fMazrfb6NYdDPrxqZwoAIIIqFkB5U0Db31UQWmjCD2fgSgHm3udngO7ZeHk7xoOntZwcWhz1/BiwCExALjxOQGr7xax/sEdLK8XoWRVTBjwa0lNjCAQajtN7D0+QW3H5C4RFYRk5gABINqvPCri7sdVFNcKkHUltPGEDkULfSmDytsSf/bcY9RemHyCvBa9NzRIBABFA8qbOaw+KqGwshTZeF9/AkHLqijdK4CiBbMH3B0GzG8R/B7MGafon2J6rqJh9b0SyvdLkWg/ThxnQj6D6jtlVB7koRnEiHEtp6uL8Ot4AZJKo2+guF6AEpH24yUM3UHL6ag+LKOwRpPqpJbX18cKAB/9sobCmoHscvDZ/np1X7WQNRm5SpbLogVVWBbEDsBSNYOlqsFj/Ct1k3kihhXXCWz19gCQK+vIFHSIUqzYjkVQVmUYlSz0vHI7APA8ClVvXuGNtSRkJU2ISkZGpqBC1WlVGbyjWIeJ2R669X4oRYKrPvyDltIiLamlENYD8aXE7o0sOHjamAn9fcDI1XRDgaLTntqvnf4eCwPI+N8A0L1b62Hvydn0GkRtKQiQJJEz4MZc4AcAmwC+Hxnz7JddMMuJatp0/3seHObCdVyE2RdEZsBnAL4cqfo1AHqnvfy/vx9OZ0DEVoOBC7vTh9Pz00fBOowMAI3+5eK/P/91D2bdvvwpkWfaJbojBoQREAmArwB8eEUqvVM9lT9+fjF6SuZG2SNmMljNHpg9YxcoAPBH+6p5VE/fD5/VcPbfxdXPsb07fQet0y6sFgvl/6RIaAZ8C6A4wRSqp+9UHv/0z+gp5psHMIvh4qADq8l4QjWMhFAAULjzZ/xJQuk7taN5IIkJkfKF7ZMOmodd9DrObAH4cZLVV+p9F6EJMc6wSCHPvrBw8lcdrSMLboSIG5gBFOY+v2LopFcKjzwsWg4IhDiKO/BgXZg42jrnWeK+GW7y83UJDMC0o+8L8NuTG0QNi2Q8JUbPt5s42mqgfdqPNPqkY6CsMK32aLETtBAIOwAqDwr49Jv3g/7OTy4o5JmNLs62G3j55AyNlxZ4LjBiajwQAME1f/2PL777BPqSBoGwv27z4oGfFjGbwawPaX/4Zw2dc4YB+X1E40m7CNm0142bVEOHoIouorieRWO/CaNMSQwdlNaiPT0vPhgjo/gix2Kw2zbap10cb9VR223DbtG6f5Kk4PUzYwDl7GQNyJZUlO4aWN4wkCtleOqMnw9KIh/QARvwjQ2NeufUQm2vjeZ+F3aLjsSIEcGNfNMfMwPAV4ISp5TFpVNizZCh5GS+n/dPh+0OA+Onw5T3d+EycLrTUXkSZeYAXDaCWMH38DQdjOIRN5R8nzZ3MY/2Zdn+840C4Ctxk/fA64CbVDYJ2SkASaA6T32mDJin0UpC15QBSaA6T32mDJin0UpC15QBSaA6T32mDJin0UpC15QBSaA6T30uPAP+B8Xv5/OOW6fPAAAAAElFTkSuQmCC";

let css = `
<style>
    .image-data-viewer .area {
        padding: 20px;
    }

    .image-data-viewer img {
        width: auto;
        height: auto;
        border: 1px dashed rgba(0, 0, 0, 0.5);
        padding: 20px;
    }

    .image-data-viewer label {
        display: block;
    }

    .image-data-viewer textarea {
        width: 100%;
        height: 40px;
        white-space: nowrap;
    }
</style>
`;

let ux = `
<div class="image-data-viewer">
    <h3>Tool for viewing image data</h3>
    <p>Paste an Image into Image Data to view the Image below</p>
    <div class='area'>
        <label>Image Data (paste image or text here)</label> 
        <textarea autocomplete="off" spellcheck="false" class='image-data-input'></textarea>
    </div>
    <div class='area'>
        <label>Image</label> 
        <img class='image'/>
    </div>
    <div class='area'>
        <label>Select an Image to update the Image Data and then the Image</label>
        <input class='image-file' type='file' accept='image/*' />
    </div>
</div>
`;

// http://www.javascripture.com/FileReader
let openFile = function (event: Event) {
    var input = <HTMLInputElement>event.target;
    var reader = new FileReader();
    // $.val is very slow!
    //reader.onload = () => $(".image-data-input").val(reader.result).change();
    reader.onload = () => {
        let textarea = $(".image-data-input");
        (<HTMLTextAreaElement>textarea[0]).value = reader.result;
        textarea.change();
    };

    reader.readAsDataURL(input.files[0]);
};

// from http://jsfiddle.net/bt7BU/225/
let pasteHandler = (event: ClipboardEvent) => {
    // use event.originalEvent.clipboard for newer chrome versions
    let items = <{ type: string }[]>(event.clipboardData || event.originalEvent.clipboardData).items;

    // find pasted image among pasted items
    let blob: File;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") === 0) {
            blob = (<DataTransferItem>items[i]).getAsFile();
            break;
        }
    }
    // load image if there is a pasted image
    if (blob) {
        var reader = new FileReader();
        reader.onload = readerEvent => {
            $(".image-data-input").val(readerEvent.target.result).change();
        };
        reader.readAsDataURL(blob);
    }
}

export function run() {
    $(ux).appendTo(".map");
    $(css).appendTo("head");

    $(".image-data-input").change(() => {
        $(".image").attr("src", $(".image-data-input").val());
    }).val(data).change();

    $(".image-data-input").on("paste", pasteHandler);

    $(".image-file").change(openFile);
}

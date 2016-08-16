/**
 * implemented by all style serializers
 */
export interface IConverter<T> {
    fromJson: (json: T) => ol.style.Style;
    toJson(style: ol.style.Style): T;
}

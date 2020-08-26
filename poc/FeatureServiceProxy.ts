import { FeatureServiceRequest } from "./FeatureServiceRequest";
import { asQueryString } from "./fun/asQueryString";

export class FeatureServiceProxy {
  constructor(public options: { service: string }) {}
  async fetch<T>(request: FeatureServiceRequest): Promise<T> {
    const baseUrl = `${this.options.service}?${asQueryString(request)}`;
    const response = await fetch(baseUrl);
    if (!response.ok) throw response.statusText;
    const data = await response.json();
    return <T>data;
  }
}

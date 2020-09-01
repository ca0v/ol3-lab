import { TileTree, TileTreeExt } from "./TileTree";
import { createXYZ } from "@ol/tilegrid";
import { tile as tileStrategy } from "@ol/loadingstrategy";
import Feature from "@ol/Feature";
import Geometry from "@ol/geom/Geometry";
import VectorLayer from "@ol/layer/Vector";
import { AgsFeatureLoader } from "./fun/AgsFeatureLoader";
import { Style, Fill, Stroke, Text } from "@ol/style";
import Circle from "@ol/style/Circle";
import { getCenter } from "@ol/extent";
import Point from "@ol/geom/Point";
import { XYZ } from "./XYZ";
import PluggableMap, { FrameState } from "@ol/PluggableMap";
import { Extent } from "@ol/extent";

export class AgsClusterLayer extends VectorLayer {
  private readonly tree: TileTree<{ count: number; center: [number, number] }>;

  constructor(options: {
    url: string;
    tileSize: number;
    maxFetchCount: number;
    maxRecordCount: number;
  }) {
    super();
    const { url, tileSize, maxFetchCount, maxRecordCount } = options;
    const tileGrid = createXYZ({ tileSize });
    const strategy = tileStrategy(tileGrid);

    this.tree = new TileTree<{ count: number; center: [number, number] }>({
      extent: tileGrid.getExtent(),
    });

    const loader = new AgsFeatureLoader({
      tree: this.tree,
      url,
      strategy,
      maxFetchCount,
      maxRecordCount,
    });
    const source = loader.source;

    this.setStyle(<any>this.createStyleFactory());
    this.setSource(source);
  }

  // do not prevent future calls when resolution increases
  public render(frameState: FrameState, target: HTMLElement): HTMLElement {
    if (!frameState) return super.render(frameState, target);
    const { center, zoom } = frameState.viewState;
    const { tree } = this;
    let tileIdentifier = tree.asXyz(
      tree.findByPoint({ point: center, zoom: Math.ceil(zoom) })
    );
    const source = this.getSource();
    console.log("removing parent extents:", tileIdentifier);
    while (true) {
      tileIdentifier = tree.parent(tileIdentifier);
      const parentNode = tree.findByXYZ(tileIdentifier);
      if (!parentNode) break;
      console.log("removeLoadedExtent:", tileIdentifier);
      source.removeLoadedExtent(parentNode.extent);
      if (tileIdentifier.Z <= 0) break;
    }
    return super.render(frameState, target);
  }

  private createStyleFactory() {
    const helper = new TileTreeExt(this.tree);

    // rules to be specified in configuration
    const circleMaker = (count: number) => {
      return new Circle({
        radius: 10 + Math.sqrt(count) / 2,
        fill: new Fill({ color: "rgba(200,0,0,1)" }),
        stroke: new Stroke({ color: "white", width: 1 }),
      });
    };

    const textMaker = (text: string) =>
      new Text({
        text: text,
        stroke: new Stroke({ color: "black", width: 1 }),
        fill: new Fill({ color: "white" }),
      });

    // can control rendering from here by returning null styles
    const style = (feature: Feature<Geometry>, resolution: number) => {
      const { tileInfo: tileIdentifier, text } = feature.getProperties() as {
        tileInfo: XYZ;
        text: string;
      };
      if (!tileIdentifier) return;

      const result = [] as Style[];

      if (tileIdentifier) {
        // if density is too low and all children are available render them instead
        if (helper.areChildrenLoaded(tileIdentifier)) {
          const visibleChildren = this.tree
            .children(tileIdentifier)
            .filter((c) => {
              const tileDensity = helper.nodeDensity(tileIdentifier);
              if (!tileDensity) return null;
              const effectiveDensity = Math.pow(resolution, 2) / tileDensity;
              if (effectiveDensity < 256) return false;
              return true;
            });
          if (4 === visibleChildren.length) {
            console.log("rendering children only");
            return null;
          }
        }

        const tileNode = this.tree.findByXYZ(tileIdentifier);
        if (!tileNode) {
          // there are no stats on this
          const vector = new Style({
            fill: new Fill({ color: "rgba(200,0,200,0.2)" }),
          });
          result.push(vector);
        } else {
          // hereiam
          let { count, center } = tileNode.data;
          if (!center) {
            center = helper.centerOfMass(tileIdentifier).center;
          }
          const style = new Style({
            image: circleMaker(count),
            text: textMaker(count + ""),
          });
          if (center) {
            style.setGeometry(new Point(center));
          } else {
            style.setGeometry(
              new Point(getCenter(feature.getGeometry()!.getExtent()))
            );
          }
          result.push(style);
        }
      } else {
        // rules specified in featureserver resonse
        const vector = new Style({
          fill: new Fill({ color: "rgba(200,0,200,0.2)" }),
        });
        result.push(vector);
      }

      if (text) {
        const style = new Style({
          image: circleMaker(10),
          text: textMaker(text),
        });
        result.push(style);
      }

      return result;
    };

    return style;
  }
}

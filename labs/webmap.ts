import $ = require("jquery");
import Portal = require("esri/arcgis/Portal");
import OAuthInfo = require("esri/arcgis/OAuthInfo");
import IdentityManager = require("esri/IdentityManager");

const webmap = "ae85c9d9c5ae409bb1f351617ea0bffc";
const appid = "q244Lb8gDRgWQ8hM";//"39557d79adad49098a209041f51621ed";
let portal = "https://www.arcgis.com";
const items_endpoint = "http://www.arcgis.com/sharing/rest/content/items";
const response = `
{
	"operationalLayers": [
		{
			"layerType": "ArcGISFeatureLayer",
			"id": "mapNotes_6968",
			"title": "Map Notes",
			"featureCollection": {
				"layers": [
					{
						"layerDefinition": {
							"objectIdField": "OBJECTID",
							"templates": [],
							"type": "Feature Layer",
							"drawingInfo": {
								"renderer": {
									"field1": "TYPEID",
									"type": "uniqueValue",
									"uniqueValueInfos": [
										{
											"symbol": {
												"style": "esriSFSSolid",
												"color": [
													246,
													238,
													183,
													255
												],
												"outline": {
													"style": "esriSLSSolid",
													"color": [
														246,
														238,
														183,
														255
													],
													"width": 1,
													"type": "esriSLS"
												},
												"type": "esriSFS"
											},
											"description": "",
											"value": "0",
											"label": "Parking Lot"
										},
										{
											"symbol": {
												"style": "esriSFSSolid",
												"color": [
													255,
													255,
													255,
													255
												],
												"outline": {
													"style": "esriSLSSolid",
													"color": [
														224,
														224,
														220,
														255
													],
													"width": 1,
													"type": "esriSLS"
												},
												"type": "esriSFS"
											},
											"description": "",
											"value": "1",
											"label": "Roadway"
										},
										{
											"symbol": {
												"style": "esriSFSSolid",
												"color": [
													188,
													169,
													169,
													255
												],
												"outline": {
													"style": "esriSLSSolid",
													"color": [
														188,
														169,
														169,
														255
													],
													"width": 1,
													"type": "esriSLS"
												},
												"type": "esriSFS"
											},
											"description": "",
											"value": "2",
											"label": "Rec Center"
										},
										{
											"symbol": {
												"style": "esriSFSSolid",
												"color": [
													51,
													204,
													153,
													255
												],
												"outline": {
													"style": "esriSLSSolid",
													"color": [
														38,
														151,
														113,
														255
													],
													"width": 1,
													"type": "esriSLS"
												},
												"type": "esriSFS"
											},
											"description": "",
											"value": "3",
											"label": "Stadium"
										},
										{
											"symbol": {
												"style": "esriSFSSolid",
												"color": [
													137,
													210,
													174,
													255
												],
												"outline": {
													"style": "esriSLSSolid",
													"color": [
														137,
														210,
														174,
														255
													],
													"width": 1,
													"type": "esriSLS"
												},
												"type": "esriSFS"
											},
											"description": "",
											"value": "4",
											"label": "Field"
										},
										{
											"symbol": {
												"style": "esriSFSSolid",
												"color": [
													206,
													236,
													168,
													255
												],
												"outline": {
													"style": "esriSLSSolid",
													"color": [
														206,
														236,
														168,
														255
													],
													"width": 1,
													"type": "esriSLS"
												},
												"type": "esriSFS"
											},
											"description": "",
											"value": "5",
											"label": "Garden"
										},
										{
											"symbol": {
												"style": "esriSFSSolid",
												"color": [
													181,
													227,
													181,
													255
												],
												"outline": {
													"style": "esriSLSSolid",
													"color": [
														181,
														227,
														181,
														255
													],
													"width": 1,
													"type": "esriSLS"
												},
												"type": "esriSFS"
											},
											"description": "",
											"value": "6",
											"label": "Golf"
										},
										{
											"symbol": {
												"style": "esriSFSSolid",
												"color": [
													181,
													208,
													208,
													255
												],
												"outline": {
													"style": "esriSLSSolid",
													"color": [
														181,
														208,
														208,
														255
													],
													"width": 1,
													"type": "esriSLS"
												},
												"type": "esriSFS"
											},
											"description": "",
											"value": "7",
											"label": "Water"
										}
									]
								}
							},
							"displayField": "TITLE",
							"visibilityField": "VISIBLE",
							"name": "Park & Rec Areas",
							"hasAttachments": false,
							"typeIdField": "TYPEID",
							"capabilities": "Query,Editing",
							"types": [
								{
									"id": 0,
									"templates": [
										{
											"drawingTool": "esriFeatureEditToolPolygon",
											"description": "",
											"name": "Parking Lot",
											"prototype": {
												"attributes": {
													"VISIBLE": 1,
													"TITLE": "Parking Lot",
													"TYPEID": 0
												}
											}
										}
									],
									"domains": {},
									"name": "Parking Lot"
								},
								{
									"id": 1,
									"templates": [
										{
											"drawingTool": "esriFeatureEditToolPolygon",
											"description": "",
											"name": "Roadway",
											"prototype": {
												"attributes": {
													"VISIBLE": 1,
													"TITLE": "Roadway",
													"TYPEID": 1
												}
											}
										}
									],
									"domains": {},
									"name": "Roadway"
								},
								{
									"id": 2,
									"templates": [
										{
											"drawingTool": "esriFeatureEditToolPolygon",
											"description": "",
											"name": "Rec Center",
											"prototype": {
												"attributes": {
													"VISIBLE": 1,
													"TITLE": "Rec Center",
													"TYPEID": 2
												}
											}
										}
									],
									"domains": {},
									"name": "Rec Center"
								},
								{
									"id": 3,
									"templates": [
										{
											"drawingTool": "esriFeatureEditToolPolygon",
											"description": "",
											"name": "Stadium",
											"prototype": {
												"attributes": {
													"VISIBLE": 1,
													"TITLE": "Stadium",
													"TYPEID": 3
												}
											}
										}
									],
									"domains": {},
									"name": "Stadium"
								},
								{
									"id": 4,
									"templates": [
										{
											"drawingTool": "esriFeatureEditToolFreehand",
											"description": "",
											"name": "Field",
											"prototype": {
												"attributes": {
													"VISIBLE": 1,
													"TITLE": "Field",
													"TYPEID": 4
												}
											}
										}
									],
									"domains": {},
									"name": "Field"
								},
								{
									"id": 5,
									"templates": [
										{
											"drawingTool": "esriFeatureEditToolFreehand",
											"description": "",
											"name": "Garden",
											"prototype": {
												"attributes": {
													"VISIBLE": 1,
													"TITLE": "Garden",
													"TYPEID": 5
												}
											}
										}
									],
									"domains": {},
									"name": "Garden"
								},
								{
									"id": 6,
									"templates": [
										{
											"drawingTool": "esriFeatureEditToolFreehand",
											"description": "",
											"name": "Golf",
											"prototype": {
												"attributes": {
													"VISIBLE": 1,
													"TITLE": "Golf",
													"TYPEID": 6
												}
											}
										}
									],
									"domains": {},
									"name": "Golf"
								},
								{
									"id": 7,
									"templates": [
										{
											"drawingTool": "esriFeatureEditToolFreehand",
											"description": "",
											"name": "Water",
											"prototype": {
												"attributes": {
													"VISIBLE": 1,
													"TITLE": "Water",
													"TYPEID": 7
												}
											}
										}
									],
									"domains": {},
									"name": "Water"
								}
							],
							"geometryType": "esriGeometryPolygon",
							"fields": [
								{
									"alias": "OBJECTID",
									"name": "OBJECTID",
									"type": "esriFieldTypeOID",
									"editable": false
								},
								{
									"alias": "Title",
									"name": "TITLE",
									"length": 255,
									"type": "esriFieldTypeString",
									"editable": true
								},
								{
									"alias": "Visible",
									"name": "VISIBLE",
									"type": "esriFieldTypeInteger",
									"editable": true
								},
								{
									"alias": "Description",
									"name": "DESCRIPTION",
									"length": 1073741822,
									"type": "esriFieldTypeString",
									"editable": true
								},
								{
									"alias": "Image URL",
									"name": "IMAGE_URL",
									"length": 255,
									"type": "esriFieldTypeString",
									"editable": true
								},
								{
									"alias": "Image Link URL",
									"name": "IMAGE_LINK_URL",
									"length": 255,
									"type": "esriFieldTypeString",
									"editable": true
								},
								{
									"alias": "DATE",
									"name": "DATE",
									"length": 36,
									"type": "esriFieldTypeDate",
									"editable": true
								},
								{
									"alias": "Type ID",
									"name": "TYPEID",
									"type": "esriFieldTypeInteger",
									"editable": true
								}
							],
							"extent": {
								"xmin": -9162776.05506832,
								"ymin": 4146168.879335383,
								"xmax": -9162599.294440426,
								"ymax": 4146318.1704062396,
								"spatialReference": {
									"wkid": 102100,
									"latestWkid": 3857
								}
							}
						},
						"popupInfo": {
							"mediaInfos": [
								{
									"value": {
										"sourceURL": "{IMAGE_URL}",
										"linkURL": "{IMAGE_LINK_URL}"
									},
									"type": "image"
								}
							],
							"title": "{TITLE}",
							"description": "{DESCRIPTION}"
						},
						"featureSet": {
							"geometryType": "esriGeometryPolygon",
							"features": [
								{
									"geometry": {
										"rings": [
											[
												[
													-9162771,
													4146249
												],
												[
													-9162767,
													4146263
												],
												[
													-9162759,
													4146278
												],
												[
													-9162752,
													4146292
												],
												[
													-9162744,
													4146306
												],
												[
													-9162729,
													4146318
												],
												[
													-9162715,
													4146318
												],
												[
													-9162701,
													4146310
												],
												[
													-9162685,
													4146299
												],
												[
													-9162671,
													4146292
												],
												[
													-9162655,
													4146281
												],
												[
													-9162641,
													4146274
												],
												[
													-9162627,
													4146266
												],
												[
													-9162612,
													4146256
												],
												[
													-9162599,
													4146242
												],
												[
													-9162604,
													4146227
												],
												[
													-9162617,
													4146213
												],
												[
													-9162628,
													4146199
												],
												[
													-9162640,
													4146184
												],
												[
													-9162654,
													4146171
												],
												[
													-9162669,
													4146169
												],
												[
													-9162683,
													4146175
												],
												[
													-9162697,
													4146181
												],
												[
													-9162712,
													4146188
												],
												[
													-9162727,
													4146196
												],
												[
													-9162741,
													4146204
												],
												[
													-9162756,
													4146213
												],
												[
													-9162767,
													4146227
												],
												[
													-9162772,
													4146242
												],
												[
													-9162776,
													4146242
												],
												[
													-9162771,
													4146249
												]
											]
										],
										"spatialReference": {
											"wkid": 102100,
											"latestWkid": 3857
										}
									},
									"attributes": {
										"VISIBLE": 1,
										"TITLE": "Field",
										"TYPEID": 4,
										"OBJECTID": 0
									},
									"symbol": {
										"color": [
											137,
											210,
											174,
											49
										],
										"outline": {
											"color": [
												137,
												210,
												174,
												255
											],
											"width": 1,
											"type": "esriSLS",
											"style": "esriSLSSolid"
										},
										"type": "esriSFS",
										"style": "esriSFSSolid"
									}
								}
							]
						},
						"nextObjectId": 1
					},
					{
						"layerDefinition": {
							"objectIdField": "OBJECTID",
							"templates": [],
							"type": "Feature Layer",
							"drawingInfo": {
								"renderer": {
									"field1": "TYPEID",
									"type": "uniqueValue",
									"uniqueValueInfos": [
										{
											"symbol": {
												"style": "esriSLSDot",
												"color": [
													239,
													172,
													153,
													255
												],
												"width": 2,
												"type": "esriSLS"
											},
											"description": "",
											"value": "0",
											"label": "Hiking"
										},
										{
											"symbol": {
												"style": "esriSLSDot",
												"color": [
													179,
													167,
													167,
													255
												],
												"width": 2,
												"type": "esriSLS"
											},
											"description": "",
											"value": "1",
											"label": "Footpath"
										},
										{
											"symbol": {
												"style": "esriSLSSolid",
												"color": [
													0,
													59,
													11,
													255
												],
												"width": 2,
												"type": "esriSLS"
											},
											"description": "",
											"value": "2",
											"label": "Cart Path"
										}
									]
								}
							},
							"displayField": "TITLE",
							"visibilityField": "VISIBLE",
							"name": "Trails, Paths, & Roads",
							"hasAttachments": false,
							"typeIdField": "TYPEID",
							"capabilities": "Query,Editing",
							"types": [
								{
									"id": 0,
									"templates": [
										{
											"drawingTool": "esriFeatureEditToolFreehand",
											"description": "",
											"name": "Hiking",
											"prototype": {
												"attributes": {
													"VISIBLE": 1,
													"TITLE": "Hiking",
													"TYPEID": 0
												}
											}
										}
									],
									"domains": {},
									"name": "Hiking"
								},
								{
									"id": 1,
									"templates": [
										{
											"drawingTool": "esriFeatureEditToolFreehand",
											"description": "",
											"name": "Footpath",
											"prototype": {
												"attributes": {
													"VISIBLE": 1,
													"TITLE": "Footpath",
													"TYPEID": 1
												}
											}
										}
									],
									"domains": {},
									"name": "Footpath"
								},
								{
									"id": 2,
									"templates": [
										{
											"drawingTool": "esriFeatureEditToolLine",
											"description": "",
											"name": "Cart Path",
											"prototype": {
												"attributes": {
													"VISIBLE": 1,
													"TITLE": "Cart Path",
													"TYPEID": 2
												}
											}
										}
									],
									"domains": {},
									"name": "Cart Path"
								}
							],
							"geometryType": "esriGeometryPolyline",
							"fields": [
								{
									"alias": "OBJECTID",
									"name": "OBJECTID",
									"type": "esriFieldTypeOID",
									"editable": false
								},
								{
									"alias": "Title",
									"name": "TITLE",
									"length": 255,
									"type": "esriFieldTypeString",
									"editable": true
								},
								{
									"alias": "Visible",
									"name": "VISIBLE",
									"type": "esriFieldTypeInteger",
									"editable": true
								},
								{
									"alias": "Description",
									"name": "DESCRIPTION",
									"length": 1073741822,
									"type": "esriFieldTypeString",
									"editable": true
								},
								{
									"alias": "Image URL",
									"name": "IMAGE_URL",
									"length": 255,
									"type": "esriFieldTypeString",
									"editable": true
								},
								{
									"alias": "Image Link URL",
									"name": "IMAGE_LINK_URL",
									"length": 255,
									"type": "esriFieldTypeString",
									"editable": true
								},
								{
									"alias": "DATE",
									"name": "DATE",
									"length": 36,
									"type": "esriFieldTypeDate",
									"editable": true
								},
								{
									"alias": "Type ID",
									"name": "TYPEID",
									"type": "esriFieldTypeInteger",
									"editable": true
								}
							],
							"extent": null
						},
						"popupInfo": {
							"mediaInfos": [
								{
									"value": {
										"sourceURL": "{IMAGE_URL}",
										"linkURL": "{IMAGE_LINK_URL}"
									},
									"type": "image"
								}
							],
							"title": "{TITLE}",
							"description": "{DESCRIPTION}"
						},
						"featureSet": {
							"geometryType": "esriGeometryPolyline",
							"features": []
						},
						"nextObjectId": 0
					},
					{
						"layerDefinition": {
							"objectIdField": "OBJECTID",
							"templates": [],
							"type": "Feature Layer",
							"drawingInfo": {
								"renderer": {
									"field1": "TYPEID",
									"type": "uniqueValue",
									"uniqueValueInfos": [
										{
											"symbol": {
												"horizontalAlignment": "left",
												"style": "esriSMSCircle",
												"backgroundColor": [
													31,
													73,
													125,
													0
												],
												"color": [
													30,
													71,
													122,
													255
												],
												"font": {
													"weight": "bold",
													"style": "normal",
													"family": "Arial",
													"size": 20
												},
												"type": "esriTS"
											},
											"description": "",
											"value": "0",
											"label": "Park Label"
										}
									]
								}
							},
							"displayField": "TITLE",
							"visibilityField": "VISIBLE",
							"name": "Park Labels",
							"hasAttachments": false,
							"typeIdField": "TYPEID",
							"capabilities": "Query,Editing",
							"types": [
								{
									"id": 0,
									"templates": [
										{
											"drawingTool": "esriFeatureEditToolText",
											"description": "",
											"name": "Park Label",
											"prototype": {
												"attributes": {
													"VISIBLE": 1,
													"TYPEID": 0
												}
											}
										}
									],
									"domains": {},
									"name": "Park Label"
								}
							],
							"geometryType": "esriGeometryPoint",
							"fields": [
								{
									"alias": "OBJECTID",
									"name": "OBJECTID",
									"type": "esriFieldTypeOID",
									"editable": false
								},
								{
									"alias": "Title",
									"name": "TITLE",
									"length": 255,
									"type": "esriFieldTypeString",
									"editable": true
								},
								{
									"alias": "Visible",
									"name": "VISIBLE",
									"type": "esriFieldTypeInteger",
									"editable": true
								},
								{
									"alias": "Description",
									"name": "DESCRIPTION",
									"length": 1073741822,
									"type": "esriFieldTypeString",
									"editable": true
								},
								{
									"alias": "Image URL",
									"name": "IMAGE_URL",
									"length": 255,
									"type": "esriFieldTypeString",
									"editable": true
								},
								{
									"alias": "Image Link URL",
									"name": "IMAGE_LINK_URL",
									"length": 255,
									"type": "esriFieldTypeString",
									"editable": true
								},
								{
									"alias": "DATE",
									"name": "DATE",
									"length": 36,
									"type": "esriFieldTypeDate",
									"editable": true
								},
								{
									"alias": "Type ID",
									"name": "TYPEID",
									"type": "esriFieldTypeInteger",
									"editable": true
								},
								{
									"alias": "Text",
									"name": "TEXT",
									"length": 255,
									"type": "esriFieldTypeString",
									"editable": true
								}
							],
							"extent": null
						},
						"featureSet": {
							"geometryType": "esriGeometryPoint",
							"features": []
						},
						"nextObjectId": 0
					},
					{
						"layerDefinition": {
							"objectIdField": "OBJECTID",
							"templates": [],
							"type": "Feature Layer",
							"drawingInfo": {
								"renderer": {
									"field1": "TYPEID",
									"type": "uniqueValue",
									"uniqueValueInfos": [
										{
											"symbol": {
												"height": 24,
												"width": 24,
												"contentType": "image/png",
												"type": "esriPMS",
												"url": "http://static.arcgis.com/images/Symbols/NPS/npsPictograph_0042b.png"
											},
											"description": "",
											"value": "0",
											"label": "Bicycle Trail"
										},
										{
											"symbol": {
												"height": 24,
												"width": 24,
												"contentType": "image/png",
												"type": "esriPMS",
												"url": "http://static.arcgis.com/images/Symbols/NPS/npsPictograph_0098b.png"
											},
											"value": "1",
											"label": "Picnic Area"
										},
										{
											"symbol": {
												"height": 24,
												"width": 24,
												"contentType": "image/png",
												"type": "esriPMS",
												"url": "http://static.arcgis.com/images/Symbols/NPS/npsPictograph_0231b.png"
											},
											"value": "2",
											"label": "Trailhead"
										},
										{
											"symbol": {
												"height": 24,
												"width": 24,
												"contentType": "image/png",
												"type": "esriPMS",
												"url": "http://static.arcgis.com/images/Symbols/NPS/npsPictograph_0109b.png"
											},
											"value": "3",
											"label": "Public Washroom"
										},
										{
											"symbol": {
												"height": 24,
												"width": 24,
												"contentType": "image/png",
												"type": "esriPMS",
												"url": "http://static.arcgis.com/images/Symbols/NPS/npsPictograph_0094b.png"
											},
											"value": "4",
											"label": "Parking"
										}
									]
								}
							},
							"displayField": "TITLE",
							"visibilityField": "VISIBLE",
							"name": "Points of Interest",
							"hasAttachments": false,
							"typeIdField": "TYPEID",
							"capabilities": "Query,Editing",
							"types": [
								{
									"id": 0,
									"templates": [
										{
											"drawingTool": "esriFeatureEditToolPoint",
											"description": "",
											"name": "Bicycle Trail",
											"prototype": {
												"attributes": {
													"VISIBLE": 1,
													"TITLE": "Bicycle Trail",
													"TYPEID": 0
												}
											}
										}
									],
									"domains": {},
									"name": "Bicycle Trail"
								},
								{
									"id": 1,
									"templates": [
										{
											"drawingTool": "esriFeatureEditToolPoint",
											"description": "",
											"name": "Picnic Area",
											"prototype": {
												"attributes": {
													"VISIBLE": 1,
													"TITLE": "Picnic Area",
													"TYPEID": 1
												}
											}
										}
									],
									"domains": {},
									"name": "Picnic Area"
								},
								{
									"id": 2,
									"templates": [
										{
											"drawingTool": "esriFeatureEditToolPoint",
											"description": "",
											"name": "Trailhead",
											"prototype": {
												"attributes": {
													"VISIBLE": 1,
													"TITLE": "Trailhead",
													"TYPEID": 2
												}
											}
										}
									],
									"domains": {},
									"name": "Trailhead"
								},
								{
									"id": 3,
									"templates": [
										{
											"drawingTool": "esriFeatureEditToolPoint",
											"description": "",
											"name": "Public Washroom",
											"prototype": {
												"attributes": {
													"VISIBLE": 1,
													"TITLE": "Public Washroom",
													"TYPEID": 3
												}
											}
										}
									],
									"domains": {},
									"name": "Public Washroom"
								},
								{
									"id": 4,
									"templates": [
										{
											"drawingTool": "esriFeatureEditToolPoint",
											"description": "",
											"name": "Parking",
											"prototype": {
												"attributes": {
													"VISIBLE": 1,
													"TITLE": "Parking",
													"TYPEID": 4
												}
											}
										}
									],
									"domains": {},
									"name": "Parking"
								}
							],
							"geometryType": "esriGeometryPoint",
							"fields": [
								{
									"alias": "OBJECTID",
									"name": "OBJECTID",
									"type": "esriFieldTypeOID",
									"editable": false
								},
								{
									"alias": "Title",
									"name": "TITLE",
									"length": 255,
									"type": "esriFieldTypeString",
									"editable": true
								},
								{
									"alias": "Visible",
									"name": "VISIBLE",
									"type": "esriFieldTypeInteger",
									"editable": true
								},
								{
									"alias": "Description",
									"name": "DESCRIPTION",
									"length": 1073741822,
									"type": "esriFieldTypeString",
									"editable": true
								},
								{
									"alias": "Image URL",
									"name": "IMAGE_URL",
									"length": 255,
									"type": "esriFieldTypeString",
									"editable": true
								},
								{
									"alias": "Image Link URL",
									"name": "IMAGE_LINK_URL",
									"length": 255,
									"type": "esriFieldTypeString",
									"editable": true
								},
								{
									"alias": "DATE",
									"name": "DATE",
									"length": 36,
									"type": "esriFieldTypeDate",
									"editable": true
								},
								{
									"alias": "Type ID",
									"name": "TYPEID",
									"type": "esriFieldTypeInteger",
									"editable": true
								}
							],
							"extent": {
								"xmin": -9162692.452168638,
								"ymin": 4146478.2103341985,
								"xmax": -9162692.451968638,
								"ymax": 4146478.210534198,
								"spatialReference": {
									"wkid": 102100,
									"latestWkid": 3857
								}
							}
						},
						"popupInfo": {
							"mediaInfos": [
								{
									"value": {
										"sourceURL": "{IMAGE_URL}",
										"linkURL": "{IMAGE_LINK_URL}"
									},
									"type": "image"
								}
							],
							"title": "{TITLE}",
							"description": "{DESCRIPTION}"
						},
						"featureSet": {
							"geometryType": "esriGeometryPoint",
							"features": [
								{
									"geometry": {
										"x": -9162692,
										"y": 4146478,
										"spatialReference": {
											"wkid": 102100,
											"latestWkid": 3857
										}
									},
									"attributes": {
										"VISIBLE": 1,
										"TITLE": "Public Washroom",
										"TYPEID": 3,
										"OBJECTID": 0
									}
								}
							]
						},
						"nextObjectId": 1
					}
				],
				"showLegend": true
			},
			"opacity": 1,
			"visibility": true
		}
	],
	"baseMap": {
		"baseMapLayers": [
			{
				"id": "World_Imagery_2017",
				"layerType": "ArcGISTiledMapServiceLayer",
				"url": "http://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer",
				"visibility": true,
				"opacity": 1,
				"title": "World Imagery"
			}
		],
		"title": "Imagery"
	},
	"spatialReference": {
		"wkid": 102100,
		"latestWkid": 3857
	},
	"authoringApp": "WebMapViewer",
	"authoringAppVersion": "4.2",
	"version": "2.5"
}`;

requirejs.config({
    paths: [{
        "esri": "//js.arcgis.com/3.17compact/"
    }]
});

declare module WebMap {

    export interface Outline {
        style: string;
        color: number[];
        width: number;
        type: string;
    }

    export interface Font {
        weight: string;
        style: string;
        family: string;
        size: number;
    }

    export interface Symbol {
        style: string;
        color: number[];
        outline: Outline;
        type: string;
        width?: number;
        horizontalAlignment: string;
        backgroundColor: number[];
        font: Font;
        height?: number;
        contentType: string;
        url: string;
    }

    export interface UniqueValueInfo {
        symbol: Symbol;
        description: string;
        value: string;
        label: string;
    }

    export interface Renderer {
        field1: string;
        type: string;
        uniqueValueInfos: UniqueValueInfo[];
    }

    export interface DrawingInfo {
        renderer: Renderer;
    }

    export interface Attributes {
        VISIBLE: number;
        TITLE: string;
        TYPEID: number;
    }

    export interface Prototype {
        attributes: Attributes;
    }

    export interface Template {
        drawingTool: string;
        description: string;
        name: string;
        prototype: Prototype;
    }

    export interface Domains {
    }

    export interface Type {
        id: number;
        templates: Template[];
        domains: Domains;
        name: string;
    }

    export interface Field {
        alias: string;
        name: string;
        type: string;
        editable: boolean;
        length?: number;
    }

    export interface SpatialReference {
        wkid: number;
        latestWkid: number;
    }

    export interface Extent {
        xmin: number;
        ymin: number;
        xmax: number;
        ymax: number;
        spatialReference: SpatialReference;
    }

    export interface LayerDefinition {
        objectIdField: string;
        templates: any[];
        type: string;
        drawingInfo: DrawingInfo;
        displayField: string;
        visibilityField: string;
        name: string;
        hasAttachments: boolean;
        typeIdField: string;
        capabilities: string;
        types: Type[];
        geometryType: string;
        fields: Field[];
        extent: Extent;
    }

    export interface Value {
        sourceURL: string;
        linkURL: string;
    }

    export interface MediaInfo {
        value: Value;
        type: string;
    }

    export interface PopupInfo {
        mediaInfos: MediaInfo[];
        title: string;
        description: string;
    }

    export interface Geometry {
        rings: number[][][];
        spatialReference: SpatialReference;
        x?: number;
        y?: number;
    }

    export interface Attributes {
        OBJECTID: number;
    }

    export interface Feature {
        geometry: Geometry;
        attributes: Attributes;
        symbol: Symbol;
    }

    export interface FeatureSet {
        geometryType: string;
        features: Feature[];
    }

    export interface Layer {
        layerDefinition: LayerDefinition;
        popupInfo: PopupInfo;
        featureSet: FeatureSet;
        nextObjectId: number;
    }

    export interface FeatureCollection {
        layers: Layer[];
        showLegend: boolean;
    }

    export interface OperationalLayer {
        layerType: string;
        id: string;
        title: string;
        featureCollection: FeatureCollection;
        opacity: number;
        visibility: boolean;
    }

    export interface BaseMapLayer {
        id: string;
        layerType: string;
        url: string;
        visibility: boolean;
        opacity: number;
        title: string;
    }

    export interface BaseMap {
        baseMapLayers: BaseMapLayer[];
        title: string;
    }

    export interface WebMap {
        operationalLayers: OperationalLayer[];
        baseMap: BaseMap;
        spatialReference: SpatialReference;
        authoringApp: string;
        authoringAppVersion: string;
        version: string;
    }

}


function endpoint() {
    return `${items_endpoint}/${webmap}/data?f=json`;
}

export function run() {

    // if the webmap is not private then we can easily get at the configuration
	// actually only a webapp can be private, all configs are public...I think    
    if (1) $.ajax({
        url: endpoint(),
		dataType: "json"
    }).done((webmap: WebMap.WebMap) => {
        console.assert(webmap.authoringApp === "WebMapViewer");
        console.assert(webmap.authoringAppVersion === "4.2");
        webmap.operationalLayers;
        webmap.baseMap;
        console.assert(webmap.spatialReference.latestWkid === 3857);
        console.assert(webmap.version === "2.5");
	});

    // but what if it is private?  We need to obtain a token from Portal for ArcGIS.
	if (0) {
		let info = new OAuthInfo({
			appId: appid,
			popup: true,
			portalUrl: portal,
			showSocialLogins: false,
			popupCallbackUrl: "oauth-callback.html?"
		});

		let im = <IdentityManager><any>IdentityManager;
		im.registerOAuthInfos([info]);

		im.findOAuthInfo(portal).appId;

		console.log("credentials", im, im.findCredential(portal));


		/**
		 * https://www.arcgis.com/sharing/oauth2/authorize?
		 * 	client_id=q244Lb8gDRgWQ8hM&response_type=token
		 * 	&state={"portalUrl":"https://www.arcgis.com"}
		 * 	&expiration=20160
		 * 	&redirect_uri=http://localhost:94/code/ol3-lab/oauth-callback.html&showSocialLogins=true
		 */
		im.checkSignInStatus(`${info.portalUrl}/sharing`).then(() => {
			debugger;
		}).otherwise(() => {
			debugger;
			im.getCredential(info.portalUrl + "/sharing", {
				oAuthPopupConfirmation: false
			}).then(() => {
				debugger;
			}).otherwise(() => {
				debugger;
			});
		});
	}

}
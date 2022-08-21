import {
  DatePropertyItemObjectResponse,
  GetPagePropertyResponse,
  NumberPropertyItemObjectResponse,
  PeoplePropertyItemObjectResponse,
  PropertyItemListResponse,
  RelationPropertyItemObjectResponse,
  RichTextPropertyItemObjectResponse,
  SelectPropertyItemObjectResponse,
  TitlePropertyItemObjectResponse,
} from '@notionhq/client/build/src/api-endpoints';

export const hasProperty = <T extends string>(
  element: unknown,
  property: T
): element is Record<T, unknown> => {
  if (element === undefined || element === null) {
    return false;
  }
  return Object.prototype.hasOwnProperty.call(element, property);
};

export const isPropertyItemListResponse = (
  response: GetPagePropertyResponse
): response is PropertyItemListResponse => {
  return hasProperty(response, 'results') && response.results !== undefined;
};

export const isRelationPropertyItemObjectResponse = (
  response: GetPagePropertyResponse
): response is RelationPropertyItemObjectResponse => {
  return hasProperty(response, 'type') && response.type === 'relation';
};

export const isDatePropertyItemObjectResponse = (
  response: GetPagePropertyResponse
): response is DatePropertyItemObjectResponse => {
  return hasProperty(response, 'type') && response.type === 'date';
};

export const isPeoplePropertyItemObjectResponse = (
  response: GetPagePropertyResponse
): response is PeoplePropertyItemObjectResponse => {
  return hasProperty(response, 'type') && response.type === 'people';
};

export const isNumberPropertyItemObjectResponse = (
  response: GetPagePropertyResponse
): response is NumberPropertyItemObjectResponse => {
  return hasProperty(response, 'type') && response.type === 'number';
};

export const isTitlePropertyItemObjectResponse = (
  response: GetPagePropertyResponse
): response is TitlePropertyItemObjectResponse => {
  return hasProperty(response, 'type') && response.type === 'title';
};

export const isRichTextPropertyItemObjectResponse = (
  response: GetPagePropertyResponse
): response is RichTextPropertyItemObjectResponse => {
  return hasProperty(response, 'type') && response.type === 'rich_text';
};

export const isSelectPropertyItemObjectResponse = (
  response: GetPagePropertyResponse
): response is SelectPropertyItemObjectResponse => {
  return hasProperty(response, 'type') && response.type === 'select';
};

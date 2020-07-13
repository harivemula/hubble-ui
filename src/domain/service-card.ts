import _ from 'lodash';

import { Service, ApplicationKind } from './service-map';
import { KV } from './misc';
import { Labels, LabelsProps } from './labels';

// This entity maintains ONLY THE DATA of service card
export class ServiceCard {
  public static readonly AppLabel = 'k8s:app';

  private _labelsProps: LabelsProps | null = null;

  public service: Service;

  constructor(service: Service) {
    this.service = service;
  }

  public static fromService(srvc: Service): ServiceCard {
    return new ServiceCard(srvc);
  }

  public clone(): ServiceCard {
    return new ServiceCard(_.cloneDeep(this.service));
  }
  public get appProtocol(): ApplicationKind | undefined {
    const appLbl = this.appLabel;
    if (appLbl == null) return undefined;

    for (const key of Object.keys(ApplicationKind)) {
      const value = (ApplicationKind as any)[key];
      if (value === appLbl) {
        return value as ApplicationKind;
      }
    }

    return undefined;
  }

  private get labelsProps(): LabelsProps {
    if (this._labelsProps === null) {
      this._labelsProps = Labels.detect(this.service.labels);
    }

    return this._labelsProps;
  }

  public get appLabel(): string | null {
    return this.labelsProps.appName || null;
  }

  public get isCovalentRelated(): boolean {
    return this.service.labels.some(l => {
      const isExporter = l.value === 'covalent-exporter';
      const isAgent = l.value === 'covalent-agent';

      return isExporter || isAgent;
    });
  }

  public get id(): string {
    return this.service.id;
  }

  public get caption(): string {
    if (this.isWorld && this.domain) {
      return this.domain;
    }
    return this.appLabel || 'Unknown App';
  }

  public get domain(): string | null {
    if (this.service.dnsNames.length === 0) return null;

    // TODO: better algorithm for getting domain name?
    return this.service.dnsNames[0];
  }

  public get labels(): Array<KV> {
    return this.service.labels;
  }

  public get namespace(): string | null {
    return Labels.findNamespaceInLabels(this.labels);
  }

  public get isWorld(): boolean {
    return this.labelsProps.isWorld;
  }

  public get isHost(): boolean {
    return this.labelsProps.isHost;
  }

  public get isInit(): boolean {
    return this.labelsProps.isInit;
  }

  public get isRemoteNode(): boolean {
    return this.labelsProps.isRemoteNode;
  }

  public get isKubeDNS(): boolean {
    return this.labelsProps.isKubeDNS;
  }

  public get isCIDR(): boolean {
    return false;
    // return (
    //   Boolean(endpoint.v4Cidrs && endpoint.v4Cidrs.length) ||
    //   Boolean(endpoint.v6Cidrs && endpoint.v6Cidrs.length)
    // );
  }

  public get hasDNS(): boolean {
    return this.service.dnsNames.length > 0;
  }

  public get isDNS(): boolean {
    return this.isWorld && this.hasDNS;
  }

  public get isAWS(): boolean {
    return (this.appProtocol || '').toLowerCase().includes('aws');
  }
}

export default ServiceCard;
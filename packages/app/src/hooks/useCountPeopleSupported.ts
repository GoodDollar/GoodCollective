import { DonorCollective } from '../models/models';
import { useCollectivesById } from './useCollectiveById';
import { useMemo } from 'react';

export function useCountPeopleSupported(donorCollectives: DonorCollective[]): number | undefined {
  const collectiveIds = useMemo(() => {
    return donorCollectives.map((donorCollective) => donorCollective.collective);
  }, [donorCollectives]);
  const collectives = useCollectivesById(collectiveIds);
  return useMemo(() => {
    return collectives?.reduce((acc, cur) => acc + cur?.stewardCollectives?.length ?? 0, 0);
  }, [collectives]);
}
